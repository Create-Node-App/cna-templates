/**
 * Webhook delivery service.
 *
 * Provides functions to emit events to configured webhook endpoints.
 * Uses database-based queue for reliable delivery with retries.
 */

import { and, arrayContains, eq, lte, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { createHmac } from 'crypto';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import type { WebhookDeliveryStatus } from '@/shared/db/schema';
import { getTenantBySlug } from '@/shared/lib/tenant';
import { isFeatureEnabled, parseTenantSettings } from '@/shared/lib/tenant-settings';

// ============================================================================
// Types
// ============================================================================

export interface WebhookEventPayload {
  /** Event type (e.g., 'person.created', 'integration.sync_completed') */
  event: string;
  /** Unique event ID for deduplication */
  eventId: string;
  /** ISO timestamp of when the event occurred */
  timestamp: string;
  /** Tenant slug */
  tenant: string;
  /** Event-specific data */
  data: Record<string, unknown>;
}

interface DeliveryResult {
  success: boolean;
  status?: number;
  durationMs?: number;
  error?: string;
  responseBody?: string;
}

// ============================================================================
// HMAC Signature
// ============================================================================

/**
 * Generate HMAC-SHA256 signature for webhook payload.
 * Recipients can verify using: HMAC-SHA256(secret, JSON.stringify(payload))
 */
export function signPayload(secret: string, payload: WebhookEventPayload): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

// ============================================================================
// Emit Event
// ============================================================================

/**
 * Emit a webhook event for a tenant.
 *
 * This function:
 * 1. Checks if webhooks are enabled for the tenant
 * 2. Finds all webhook endpoints subscribed to this event type
 * 3. Creates delivery records for each endpoint
 * 4. Attempts immediate delivery (best-effort)
 *
 * @param tenantSlug - Tenant identifier
 * @param eventType - Event type (e.g., 'person.created')
 * @param data - Event payload data
 */
export async function emitWebhookEvent(
  tenantSlug: string,
  eventType: string,
  data: Record<string, unknown>,
): Promise<{ success: boolean; deliveryIds: string[] }> {
  try {
    // Get tenant
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) {
      console.warn(`[Webhook] Tenant not found: ${tenantSlug}`);
      return { success: false, deliveryIds: [] };
    }

    // Check if webhooks are enabled
    const settings = parseTenantSettings(tenant.settings);
    if (!isFeatureEnabled(settings, 'webhooks')) {
      return { success: true, deliveryIds: [] };
    }

    // Find subscribed endpoints
    const endpoints = await db.query.webhookEndpoints.findMany({
      where: and(
        eq(schema.webhookEndpoints.tenantId, tenant.id),
        eq(schema.webhookEndpoints.enabled, true),
        arrayContains(schema.webhookEndpoints.events, [eventType]),
      ),
    });

    if (endpoints.length === 0) {
      return { success: true, deliveryIds: [] };
    }

    // Create event payload
    const eventId = uuidv4();
    const timestamp = new Date().toISOString();

    const payload: WebhookEventPayload = {
      event: eventType,
      eventId,
      timestamp,
      tenant: tenantSlug,
      data,
    };

    // Create delivery records
    const deliveryIds: string[] = [];

    for (const endpoint of endpoints) {
      const deliveryId = uuidv4();
      deliveryIds.push(deliveryId);

      await db.insert(schema.webhookDeliveries).values({
        id: deliveryId,
        tenantId: tenant.id,
        endpointId: endpoint.id,
        eventType,
        eventId,
        payload: payload as unknown as Record<string, unknown>,
        status: 'pending',
        attempts: 0,
      });
    }

    // Attempt immediate delivery (fire-and-forget, errors caught inside)
    for (const endpoint of endpoints) {
      const deliveryId = deliveryIds[endpoints.indexOf(endpoint)];
      // Don't await - process in background
      processDelivery(deliveryId, endpoint, payload).catch((err) => {
        console.error(`[Webhook] Background delivery failed for ${deliveryId}:`, err);
      });
    }

    return { success: true, deliveryIds };
  } catch (error) {
    console.error('[Webhook] Failed to emit event:', error);
    return { success: false, deliveryIds: [] };
  }
}

// ============================================================================
// Process Delivery
// ============================================================================

/**
 * Process a single webhook delivery.
 */
async function processDelivery(
  deliveryId: string,
  endpoint: schema.WebhookEndpoint,
  payload: WebhookEventPayload,
): Promise<void> {
  const startTime = Date.now();

  try {
    // Update status to retrying if this is a retry
    const delivery = await db.query.webhookDeliveries.findFirst({
      where: eq(schema.webhookDeliveries.id, deliveryId),
    });

    if (!delivery) {
      return;
    }

    // Make HTTP request
    const result = await deliverWebhook(endpoint, payload);

    const durationMs = Date.now() - startTime;

    if (result.success) {
      // Mark as success
      await db
        .update(schema.webhookDeliveries)
        .set({
          status: 'success' as WebhookDeliveryStatus,
          attempts: delivery.attempts + 1,
          lastAttemptAt: new Date(),
          completedAt: new Date(),
          responseStatus: result.status,
          responseBody: result.responseBody?.slice(0, 1000),
          durationMs,
        })
        .where(eq(schema.webhookDeliveries.id, deliveryId));
    } else {
      // Check if we should retry
      const shouldRetry = delivery.attempts + 1 < endpoint.retryCount;

      if (shouldRetry) {
        // Calculate next retry time (exponential backoff: 1min, 5min, 15min, 30min, 1hr)
        const backoffMinutes = [1, 5, 15, 30, 60];
        const backoffIndex = Math.min(delivery.attempts, backoffMinutes.length - 1);
        const nextRetryAt = new Date(Date.now() + backoffMinutes[backoffIndex] * 60 * 1000);

        await db
          .update(schema.webhookDeliveries)
          .set({
            status: 'retrying' as WebhookDeliveryStatus,
            attempts: delivery.attempts + 1,
            lastAttemptAt: new Date(),
            nextRetryAt,
            responseStatus: result.status,
            responseBody: result.responseBody?.slice(0, 1000),
            errorMessage: result.error,
            durationMs,
          })
          .where(eq(schema.webhookDeliveries.id, deliveryId));
      } else {
        // Max retries reached - mark as failed
        await db
          .update(schema.webhookDeliveries)
          .set({
            status: 'failed' as WebhookDeliveryStatus,
            attempts: delivery.attempts + 1,
            lastAttemptAt: new Date(),
            completedAt: new Date(),
            responseStatus: result.status,
            responseBody: result.responseBody?.slice(0, 1000),
            errorMessage: result.error,
            durationMs,
          })
          .where(eq(schema.webhookDeliveries.id, deliveryId));
      }
    }
  } catch (error) {
    console.error(`[Webhook] Error processing delivery ${deliveryId}:`, error);

    await db
      .update(schema.webhookDeliveries)
      .set({
        status: 'failed' as WebhookDeliveryStatus,
        attempts:
          (
            await db.query.webhookDeliveries.findFirst({
              where: eq(schema.webhookDeliveries.id, deliveryId),
              columns: { attempts: true },
            })
          )?.attempts ?? 0 + 1,
        lastAttemptAt: new Date(),
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      })
      .where(eq(schema.webhookDeliveries.id, deliveryId));
  }
}

// ============================================================================
// Deliver Webhook
// ============================================================================

/**
 * Make HTTP POST request to webhook endpoint.
 */
async function deliverWebhook(endpoint: schema.WebhookEndpoint, payload: WebhookEventPayload): Promise<DeliveryResult> {
  try {
    const signature = signPayload(endpoint.secret, payload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': payload.event,
      'X-Webhook-Id': payload.eventId,
      ...(endpoint.headers ?? {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text().catch(() => '');

    if (response.ok) {
      return {
        success: true,
        status: response.status,
        responseBody,
      };
    } else {
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseBody,
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout (30s)',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Retry Failed Deliveries
// ============================================================================

/**
 * Process pending retries.
 * Call this from a cron job or scheduled task.
 */
export async function processRetryQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
  const now = new Date();

  // Find deliveries ready for retry
  const pendingDeliveries = await db.query.webhookDeliveries.findMany({
    where: and(
      or(eq(schema.webhookDeliveries.status, 'pending'), eq(schema.webhookDeliveries.status, 'retrying')),
      lte(schema.webhookDeliveries.nextRetryAt, now),
    ),
    limit: 100, // Process in batches
    with: {
      endpoint: true,
    },
  });

  let succeeded = 0;
  let failed = 0;

  for (const delivery of pendingDeliveries) {
    if (!delivery.endpoint) {
      // Endpoint was deleted - mark as failed
      await db
        .update(schema.webhookDeliveries)
        .set({
          status: 'failed' as WebhookDeliveryStatus,
          completedAt: new Date(),
          errorMessage: 'Endpoint was deleted',
        })
        .where(eq(schema.webhookDeliveries.id, delivery.id));
      failed++;
      continue;
    }

    const payload = delivery.payload as unknown as WebhookEventPayload;
    const result = await deliverWebhook(delivery.endpoint, payload);

    if (result.success) {
      await db
        .update(schema.webhookDeliveries)
        .set({
          status: 'success' as WebhookDeliveryStatus,
          attempts: delivery.attempts + 1,
          lastAttemptAt: new Date(),
          completedAt: new Date(),
          responseStatus: result.status,
          durationMs: result.durationMs,
        })
        .where(eq(schema.webhookDeliveries.id, delivery.id));
      succeeded++;
    } else {
      const shouldRetry = delivery.attempts + 1 < delivery.endpoint.retryCount;

      if (shouldRetry) {
        const backoffMinutes = [1, 5, 15, 30, 60];
        const backoffIndex = Math.min(delivery.attempts, backoffMinutes.length - 1);
        const nextRetryAt = new Date(Date.now() + backoffMinutes[backoffIndex] * 60 * 1000);

        await db
          .update(schema.webhookDeliveries)
          .set({
            status: 'retrying' as WebhookDeliveryStatus,
            attempts: delivery.attempts + 1,
            lastAttemptAt: new Date(),
            nextRetryAt,
            errorMessage: result.error,
            responseStatus: result.status,
          })
          .where(eq(schema.webhookDeliveries.id, delivery.id));
      } else {
        await db
          .update(schema.webhookDeliveries)
          .set({
            status: 'failed' as WebhookDeliveryStatus,
            attempts: delivery.attempts + 1,
            lastAttemptAt: new Date(),
            completedAt: new Date(),
            errorMessage: result.error,
            responseStatus: result.status,
          })
          .where(eq(schema.webhookDeliveries.id, delivery.id));
        failed++;
      }
    }
  }

  return {
    processed: pendingDeliveries.length,
    succeeded,
    failed,
  };
}

// ============================================================================
// Test Webhook
// ============================================================================

/**
 * Send a test event to a specific webhook endpoint.
 */
export async function sendTestWebhook(
  tenantSlug: string,
  endpointId: string,
): Promise<{ success: boolean; error?: string; status?: number; durationMs?: number }> {
  try {
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const endpoint = await db.query.webhookEndpoints.findFirst({
      where: and(eq(schema.webhookEndpoints.id, endpointId), eq(schema.webhookEndpoints.tenantId, tenant.id)),
    });

    if (!endpoint) {
      return { success: false, error: 'Endpoint not found' };
    }

    const payload: WebhookEventPayload = {
      event: 'test',
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      tenant: tenantSlug,
      data: {
        message: 'This is a test webhook from Next.js SaaS AI Template',
        sentAt: new Date().toISOString(),
      },
    };

    const startTime = Date.now();
    const result = await deliverWebhook(endpoint, payload);
    const durationMs = Date.now() - startTime;

    return {
      success: result.success,
      error: result.error,
      status: result.status,
      durationMs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
