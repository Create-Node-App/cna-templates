import { relations } from 'drizzle-orm';
import { index, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { persons } from './persons';
import { appSchema } from './schema';
import { tenants } from './tenants';

/**
 * Audit events table - System-wide audit trail
 *
 * Records all significant actions in the system for
 * compliance, debugging, and analytics purposes.
 */
export const auditEvents = appSchema.table(
  'audit_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),

    // Who performed the action (null for system actions)
    actorId: uuid('actor_id').references(() => persons.id, { onDelete: 'set null' }),

    // What happened
    action: text('action').notNull(), // e.g., 'person.created', 'integration.sync_completed'
    entityType: text('entity_type').notNull(), // e.g., 'person', 'knowledge_doc', 'integration'
    entityId: uuid('entity_id'), // ID of the affected entity

    // Change details
    changes: jsonb('changes').$type<Record<string, unknown>>(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),

    // Request context for tracing
    requestId: text('request_id'), // Correlation ID
    traceId: text('trace_id'), // Distributed trace ID
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // AI context (if action involved AI)
    aiModelVersion: text('ai_model_version'),
    aiPromptVersion: text('ai_prompt_version'),

    // Timestamp (use high precision for ordering)
    timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    // Index for querying by tenant
    index('audit_events_tenant_idx').on(table.tenantId),
    // Index for querying by entity
    index('audit_events_entity_idx').on(table.entityType, table.entityId),
    // Index for querying by actor
    index('audit_events_actor_idx').on(table.actorId),
    // Index for time-based queries
    index('audit_events_timestamp_idx').on(table.timestamp),
    // Index for request tracing
    index('audit_events_request_idx').on(table.requestId),
  ],
);

// Relations
export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditEvents.tenantId],
    references: [tenants.id],
  }),
  actor: one(persons, {
    fields: [auditEvents.actorId],
    references: [persons.id],
  }),
}));

// Types
export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
