import { relations } from 'drizzle-orm';
import { boolean, index, jsonb, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { persons } from './persons';
import { appSchema } from './schema';
import { tenants } from './tenants';

export const integrationProviderEnum = appSchema.enum('integration_provider', ['github']);

export const integrationSyncModeEnum = appSchema.enum('integration_sync_mode', [
  'migration_full',
  'sync_incremental',
  'reconcile',
  'dry_run',
]);

export const integrationSyncRunStatusEnum = appSchema.enum('integration_sync_run_status', [
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
]);

export const integrationSyncItemStatusEnum = appSchema.enum('integration_sync_item_status', [
  'created',
  'updated',
  'skipped_no_change',
  'conflict',
  'error',
]);

export const integrationEntityLinkStateEnum = appSchema.enum('integration_entity_link_state', [
  'linked',
  'conflict',
  'orphaned',
  'deleted_remote',
]);

export const integrationConflictStatusEnum = appSchema.enum('integration_conflict_status', [
  'open',
  'resolved',
  'ignored',
]);

export const integrationConflictSeverityEnum = appSchema.enum('integration_conflict_severity', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const integrationFieldOwnershipEnum = appSchema.enum('integration_field_ownership', [
  'remote_authoritative',
  'local_authoritative',
  'merge',
  'append_only',
]);

export const integrationEntityLinks = appSchema.table(
  'integration_entity_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    provider: integrationProviderEnum('provider').notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    externalId: text('external_id').notNull(),
    localEntityType: varchar('local_entity_type', { length: 80 }).notNull(),
    localEntityId: text('local_entity_id').notNull(),
    syncHash: varchar('sync_hash', { length: 128 }),
    externalUpdatedAt: timestamp('external_updated_at', { withTimezone: true }),
    linkState: integrationEntityLinkStateEnum('link_state').default('linked').notNull(),
    metadata: jsonb('metadata'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('integration_entity_links_external_unique').on(
      table.tenantId,
      table.provider,
      table.entityType,
      table.externalId,
    ),
    index('integration_entity_links_local_lookup_idx').on(table.tenantId, table.localEntityType, table.localEntityId),
    index('integration_entity_links_state_idx').on(table.tenantId, table.provider, table.linkState),
  ],
);

export const integrationSyncRuns = appSchema.table(
  'integration_sync_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    provider: integrationProviderEnum('provider').notNull(),
    mode: integrationSyncModeEnum('mode').notNull(),
    status: integrationSyncRunStatusEnum('status').default('queued').notNull(),
    entities: text('entities').array().default([]).notNull(),
    scope: jsonb('scope'),
    summary: jsonb('summary'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    triggeredByPersonId: uuid('triggered_by_person_id').references(() => persons.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('integration_sync_runs_provider_status_idx').on(table.tenantId, table.provider, table.status),
    index('integration_sync_runs_started_at_idx').on(table.startedAt),
  ],
);

export const integrationSyncRunItems = appSchema.table(
  'integration_sync_run_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    runId: uuid('run_id')
      .notNull()
      .references(() => integrationSyncRuns.id, { onDelete: 'cascade' }),
    provider: integrationProviderEnum('provider').notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    externalId: text('external_id'),
    localEntityType: varchar('local_entity_type', { length: 80 }),
    localEntityId: text('local_entity_id'),
    status: integrationSyncItemStatusEnum('status').notNull(),
    reason: text('reason'),
    payloadHash: varchar('payload_hash', { length: 128 }),
    diff: jsonb('diff'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('integration_sync_run_items_run_idx').on(table.runId),
    index('integration_sync_run_items_status_idx').on(table.tenantId, table.provider, table.status),
  ],
);

export const integrationSyncCursors = appSchema.table(
  'integration_sync_cursors',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    provider: integrationProviderEnum('provider').notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    scopeHash: varchar('scope_hash', { length: 128 }).notNull(),
    cursorValue: text('cursor_value').notNull(),
    metadata: jsonb('metadata'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('integration_sync_cursors_unique').on(
      table.tenantId,
      table.provider,
      table.entityType,
      table.scopeHash,
    ),
  ],
);

export const integrationSyncConflicts = appSchema.table(
  'integration_sync_conflicts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    runId: uuid('run_id').references(() => integrationSyncRuns.id, { onDelete: 'set null' }),
    provider: integrationProviderEnum('provider').notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    externalId: text('external_id'),
    status: integrationConflictStatusEnum('status').default('open').notNull(),
    severity: integrationConflictSeverityEnum('severity').default('medium').notNull(),
    conflictType: varchar('conflict_type', { length: 100 }).notNull(),
    details: jsonb('details'),
    resolutionAction: varchar('resolution_action', { length: 80 }),
    resolvedByPersonId: uuid('resolved_by_person_id').references(() => persons.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('integration_sync_conflicts_open_idx').on(table.tenantId, table.provider, table.status),
    index('integration_sync_conflicts_run_idx').on(table.runId),
  ],
);

export const integrationFieldMappings = appSchema.table(
  'integration_field_mappings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    provider: integrationProviderEnum('provider').notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    fieldPath: varchar('field_path', { length: 255 }).notNull(),
    ownership: integrationFieldOwnershipEnum('ownership').default('merge').notNull(),
    mergeStrategy: varchar('merge_strategy', { length: 80 }),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('integration_field_mappings_unique').on(
      table.tenantId,
      table.provider,
      table.entityType,
      table.fieldPath,
    ),
  ],
);

export const integrationSyncRunsRelations = relations(integrationSyncRuns, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [integrationSyncRuns.tenantId],
    references: [tenants.id],
  }),
  triggeredByPerson: one(persons, {
    fields: [integrationSyncRuns.triggeredByPersonId],
    references: [persons.id],
  }),
  items: many(integrationSyncRunItems),
  conflicts: many(integrationSyncConflicts),
}));

export const integrationSyncRunItemsRelations = relations(integrationSyncRunItems, ({ one }) => ({
  run: one(integrationSyncRuns, {
    fields: [integrationSyncRunItems.runId],
    references: [integrationSyncRuns.id],
  }),
}));

export const integrationSyncConflictsRelations = relations(integrationSyncConflicts, ({ one }) => ({
  run: one(integrationSyncRuns, {
    fields: [integrationSyncConflicts.runId],
    references: [integrationSyncRuns.id],
  }),
  resolvedByPerson: one(persons, {
    fields: [integrationSyncConflicts.resolvedByPersonId],
    references: [persons.id],
  }),
}));

export type IntegrationEntityLink = typeof integrationEntityLinks.$inferSelect;
export type NewIntegrationEntityLink = typeof integrationEntityLinks.$inferInsert;
export type IntegrationSyncRun = typeof integrationSyncRuns.$inferSelect;
export type NewIntegrationSyncRun = typeof integrationSyncRuns.$inferInsert;
export type IntegrationSyncRunItem = typeof integrationSyncRunItems.$inferSelect;
export type NewIntegrationSyncRunItem = typeof integrationSyncRunItems.$inferInsert;
export type IntegrationSyncCursor = typeof integrationSyncCursors.$inferSelect;
export type NewIntegrationSyncCursor = typeof integrationSyncCursors.$inferInsert;
export type IntegrationSyncConflict = typeof integrationSyncConflicts.$inferSelect;
export type NewIntegrationSyncConflict = typeof integrationSyncConflicts.$inferInsert;
export type IntegrationFieldMapping = typeof integrationFieldMappings.$inferSelect;
export type NewIntegrationFieldMapping = typeof integrationFieldMappings.$inferInsert;
