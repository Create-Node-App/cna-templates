import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { appSchema } from './schema';
import { tenants } from './tenants';

/**
 * Webhook delivery status enum
 */
export const webhookDeliveryStatusEnum = appSchema.enum('webhook_delivery_status', [
  'pending',
  'success',
  'failed',
  'retrying',
]);

/**
 * Webhook endpoints configured by tenant admins.
 * Each endpoint can subscribe to multiple event types and will receive
 * HTTP POST requests with signed payloads when those events occur.
 */
export const webhookEndpoints = appSchema.table(
  'webhook_endpoints',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    /** Display name for the webhook */
    name: varchar('name', { length: 100 }).notNull(),

    /** Target URL (HTTPS required in production) */
    url: text('url').notNull(),

    /** Secret for HMAC signature verification */
    secret: varchar('secret', { length: 64 }).notNull(),

    /** Array of subscribed event types (e.g., ['person.created', 'integration.sync_completed']) */
    events: text('events').array().notNull(),

    /** Whether the webhook is active */
    enabled: boolean('enabled').notNull().default(true),

    /** Custom headers to include in requests (e.g., Authorization) */
    headers: jsonb('headers').$type<Record<string, string>>(),

    /** Maximum retry attempts (0-5) */
    retryCount: integer('retry_count').notNull().default(3),

    /** Description or notes about this webhook */
    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('webhook_endpoints_tenant_idx').on(table.tenantId),
    index('webhook_endpoints_enabled_idx').on(table.tenantId, table.enabled),
  ],
);

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [webhookEndpoints.tenantId],
    references: [tenants.id],
  }),
  deliveries: many(webhookDeliveries),
}));

/**
 * Webhook delivery records - tracks each attempt to deliver a webhook.
 * Used for retry logic, debugging, and delivery history.
 */
export const webhookDeliveries = appSchema.table(
  'webhook_deliveries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    endpointId: uuid('endpoint_id')
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: 'cascade' }),

    /** Event type that triggered this delivery */
    eventType: varchar('event_type', { length: 100 }).notNull(),

    /** Event ID for deduplication */
    eventId: uuid('event_id').notNull(),

    /** The payload sent to the webhook */
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),

    /** Current delivery status */
    status: webhookDeliveryStatusEnum('status').notNull().default('pending'),

    /** Number of delivery attempts made */
    attempts: integer('attempts').notNull().default(0),

    /** Timestamp of last delivery attempt */
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),

    /** Scheduled time for next retry (null if not scheduled) */
    nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),

    /** HTTP response status code from last attempt */
    responseStatus: integer('response_status'),

    /** HTTP response body from last attempt (truncated) */
    responseBody: text('response_body'),

    /** Error message if delivery failed */
    errorMessage: text('error_message'),

    /** Duration of last request in milliseconds */
    durationMs: integer('duration_ms'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('webhook_deliveries_tenant_idx').on(table.tenantId),
    index('webhook_deliveries_endpoint_idx').on(table.endpointId),
    index('webhook_deliveries_status_idx').on(table.status),
    index('webhook_deliveries_pending_idx').on(table.tenantId, table.status, table.nextRetryAt),
    index('webhook_deliveries_event_idx').on(table.eventId),
  ],
);

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [webhookDeliveries.tenantId],
    references: [tenants.id],
  }),
  endpoint: one(webhookEndpoints, {
    fields: [webhookDeliveries.endpointId],
    references: [webhookEndpoints.id],
  }),
}));

// Type exports
export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type NewWebhookEndpoint = typeof webhookEndpoints.$inferInsert;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;
export type WebhookDeliveryStatus = (typeof webhookDeliveryStatusEnum.enumValues)[number];
