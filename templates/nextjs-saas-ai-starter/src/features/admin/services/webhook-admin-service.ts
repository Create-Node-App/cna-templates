'use server';

/**
 * Server actions for managing webhook endpoints (CRUD operations).
 */

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { hasPermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';
import { generateWebhookSecret, type WebhookEventType, webhookEventTypes } from '@/shared/lib/tenant-settings';
import { sendTestWebhook } from '@/shared/services/webhook-service';

// ============================================================================
// Types
// ============================================================================

export interface WebhookEndpointInput {
  name: string;
  url: string;
  events: string[];
  enabled?: boolean;
  description?: string;
  headers?: Record<string, string>;
  retryCount?: number;
}

export interface WebhookEndpointOutput {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  description: string | null;
  headers: Record<string, string> | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Stats
  totalDeliveries?: number;
  successfulDeliveries?: number;
  failedDeliveries?: number;
}

export interface WebhookDeliveryOutput {
  id: string;
  eventType: string;
  eventId: string;
  status: string;
  attempts: number;
  responseStatus: number | null;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: Date;
  completedAt: Date | null;
}

// ============================================================================
// List Webhooks
// ============================================================================

export async function listWebhookEndpoints(
  tenantSlug: string,
): Promise<{ success: true; data: WebhookEndpointOutput[] } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  const endpoints = await db.query.webhookEndpoints.findMany({
    where: eq(schema.webhookEndpoints.tenantId, tenant.id),
    orderBy: [desc(schema.webhookEndpoints.createdAt)],
  });
  // Get delivery stats for each endpoint
  const result: WebhookEndpointOutput[] = await Promise.all(
    endpoints.map(async (ep) => {
      const deliveries = await db.query.webhookDeliveries.findMany({
        where: eq(schema.webhookDeliveries.endpointId, ep.id),
        columns: { status: true },
      });

      const totalDeliveries = deliveries.length;
      const successfulDeliveries = deliveries.filter((d) => d.status === 'success').length;
      const failedDeliveries = deliveries.filter((d) => d.status === 'failed').length;

      return {
        id: ep.id,
        name: ep.name,
        url: ep.url,
        events: ep.events ?? [],
        enabled: ep.enabled,
        description: ep.description ?? null,
        headers: ep.headers,
        retryCount: ep.retryCount,
        createdAt: ep.createdAt,
        updatedAt: ep.updatedAt,
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
      };
    }),
  );

  return { success: true, data: result };
}

// ============================================================================
// Get Single Webhook
// ============================================================================

export async function getWebhookEndpoint(
  tenantSlug: string,
  endpointId: string,
): Promise<{ success: true; data: WebhookEndpointOutput } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  const endpoint = await db.query.webhookEndpoints.findFirst({
    where: and(eq(schema.webhookEndpoints.id, endpointId), eq(schema.webhookEndpoints.tenantId, tenant.id)),
  });

  if (!endpoint) {
    return { success: false, error: 'Webhook not found' };
  }

  return {
    success: true,
    data: {
      id: endpoint.id,
      name: endpoint.name,
      url: endpoint.url,
      events: endpoint.events ?? [],
      enabled: endpoint.enabled,
      description: endpoint.description,
      headers: endpoint.headers,
      retryCount: endpoint.retryCount,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    },
  };
}

// ============================================================================
// Create Webhook
// ============================================================================

export async function createWebhookEndpoint(
  tenantSlug: string,
  input: WebhookEndpointInput,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  // Validate events
  const validEvents = input.events.filter((e): e is WebhookEventType =>
    webhookEventTypes.includes(e as WebhookEventType),
  );

  if (validEvents.length === 0) {
    return { success: false, error: 'At least one valid event is required' };
  }

  // Validate URL (must be HTTPS in production)
  try {
    const url = new URL(input.url);
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      return { success: false, error: 'Webhook URL must use HTTPS' };
    }
  } catch {
    return { success: false, error: 'Invalid URL' };
  }

  // Generate secret
  const secret = generateWebhookSecret();

  const [endpoint] = await db
    .insert(schema.webhookEndpoints)
    .values({
      id: uuidv4(),
      tenantId: tenant.id,
      name: input.name,
      url: input.url,
      secret,
      events: validEvents,
      enabled: input.enabled ?? true,
      description: input.description ?? null,
      headers: input.headers ?? null,
      retryCount: input.retryCount ?? 3,
    })
    .returning({ id: schema.webhookEndpoints.id });

  revalidatePath(`/t/${tenantSlug}/admin/integrations/webhooks`);

  return { success: true, data: { id: endpoint.id } };
}

// ============================================================================
// Update Webhook
// ============================================================================

export async function updateWebhookEndpoint(
  tenantSlug: string,
  endpointId: string,
  input: Partial<WebhookEndpointInput>,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  // Verify endpoint exists and belongs to tenant
  const existing = await db.query.webhookEndpoints.findFirst({
    where: and(eq(schema.webhookEndpoints.id, endpointId), eq(schema.webhookEndpoints.tenantId, tenant.id)),
  });

  if (!existing) {
    return { success: false, error: 'Webhook not found' };
  }

  const updateData: Partial<schema.NewWebhookEndpoint> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.url !== undefined) {
    try {
      const url = new URL(input.url);
      if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
        return { success: false, error: 'Webhook URL must use HTTPS' };
      }
    } catch {
      return { success: false, error: 'Invalid URL' };
    }
    updateData.url = input.url;
  }

  if (input.events !== undefined) {
    const validEvents = input.events.filter((e): e is WebhookEventType =>
      webhookEventTypes.includes(e as WebhookEventType),
    );
    if (validEvents.length === 0) {
      return { success: false, error: 'At least one valid event is required' };
    }
    updateData.events = validEvents;
  }

  if (input.enabled !== undefined) {
    updateData.enabled = input.enabled;
  }

  if (input.description !== undefined) {
    updateData.description = input.description;
  }

  if (input.headers !== undefined) {
    updateData.headers = input.headers;
  }

  if (input.retryCount !== undefined) {
    updateData.retryCount = Math.min(5, Math.max(0, input.retryCount));
  }

  await db.update(schema.webhookEndpoints).set(updateData).where(eq(schema.webhookEndpoints.id, endpointId));

  if (input.description !== undefined) {
  }

  revalidatePath(`/t/${tenantSlug}/admin/integrations/webhooks`);

  return { success: true };
}

// ============================================================================
// Delete Webhook
// ============================================================================

export async function deleteWebhookEndpoint(
  tenantSlug: string,
  endpointId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  // Verify endpoint exists and belongs to tenant
  const existing = await db.query.webhookEndpoints.findFirst({
    where: and(eq(schema.webhookEndpoints.id, endpointId), eq(schema.webhookEndpoints.tenantId, tenant.id)),
  });

  if (!existing) {
    return { success: false, error: 'Webhook not found' };
  }

  // Delete will cascade to deliveries
  await db.delete(schema.webhookEndpoints).where(eq(schema.webhookEndpoints.id, endpointId));

  revalidatePath(`/t/${tenantSlug}/admin/integrations/webhooks`);

  return { success: true };
}

// ============================================================================
// Toggle Webhook Enabled
// ============================================================================

export async function toggleWebhookEndpoint(
  tenantSlug: string,
  endpointId: string,
  enabled: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  return updateWebhookEndpoint(tenantSlug, endpointId, { enabled });
}

// ============================================================================
// Regenerate Secret
// ============================================================================

export async function regenerateWebhookSecret(
  tenantSlug: string,
  endpointId: string,
): Promise<{ success: true; data: { secret: string } } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  const existing = await db.query.webhookEndpoints.findFirst({
    where: and(eq(schema.webhookEndpoints.id, endpointId), eq(schema.webhookEndpoints.tenantId, tenant.id)),
  });

  if (!existing) {
    return { success: false, error: 'Webhook not found' };
  }

  const newSecret = generateWebhookSecret();

  await db
    .update(schema.webhookEndpoints)
    .set({ secret: newSecret, updatedAt: new Date() })
    .where(eq(schema.webhookEndpoints.id, endpointId));

  revalidatePath(`/t/${tenantSlug}/admin/integrations/webhooks`);

  return { success: true, data: { secret: newSecret } };
}

// ============================================================================
// Get Webhook Deliveries (History)
// ============================================================================

export async function getWebhookDeliveries(
  tenantSlug: string,
  endpointId: string,
  limit = 50,
): Promise<{ success: true; data: WebhookDeliveryOutput[] } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  // Verify endpoint belongs to tenant
  const endpoint = await db.query.webhookEndpoints.findFirst({
    where: and(eq(schema.webhookEndpoints.id, endpointId), eq(schema.webhookEndpoints.tenantId, tenant.id)),
  });

  if (!endpoint) {
    return { success: false, error: 'Webhook not found' };
  }

  const deliveries = await db.query.webhookDeliveries.findMany({
    where: eq(schema.webhookDeliveries.endpointId, endpointId),
    orderBy: [desc(schema.webhookDeliveries.createdAt)],
    limit,
  });

  return {
    success: true,
    data: deliveries.map((d) => ({
      id: d.id,
      eventType: d.eventType,
      eventId: d.eventId,
      status: d.status,
      attempts: d.attempts,
      responseStatus: d.responseStatus,
      errorMessage: d.errorMessage,
      durationMs: d.durationMs,
      createdAt: d.createdAt,
      completedAt: d.completedAt,
    })),
  };
}

// ============================================================================
// Get Available Event Types
// ============================================================================

export async function getAvailableEventTypes(): Promise<{ value: string; label: string; category: string }[]> {
  const eventCategories: Record<string, { events: WebhookEventType[]; label: string }> = {
    person: {
      events: ['person.created', 'person.updated'],
      label: 'People',
    },
    member: {
      events: ['member.invited', 'member.joined', 'member.deactivated'],
      label: 'Members',
    },
    integration: {
      events: ['integration.synced', 'integration.failed'],
      label: 'Integrations',
    },
    bulk: {
      events: ['bulk_import.completed', 'bulk_import.failed'],
      label: 'Bulk Import',
    },
  };

  const result: { value: string; label: string; category: string }[] = [];

  for (const [, cat] of Object.entries(eventCategories)) {
    for (const event of cat.events) {
      result.push({
        value: event,
        label: event.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        category: cat.label,
      });
    }
  }

  return result;
}

// ============================================================================
// Test Webhook
// ============================================================================

export async function testWebhookEndpoint(
  tenantSlug: string,
  endpointId: string,
): Promise<{ success: true; status: number; durationMs: number } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:integrations');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  const result = await sendTestWebhook(tenantSlug, endpointId);

  if (result.success) {
    return {
      success: true,
      status: result.status ?? 200,
      durationMs: result.durationMs ?? 0,
    };
  } else {
    return { success: false, error: result.error ?? 'Unknown error' };
  }
}
