import { relations } from 'drizzle-orm';
import { index, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { persons } from './persons';
import { appSchema } from './schema';
import { tenants } from './tenants';

/**
 * Integration type enum for processing jobs
 */
export const integrationTypeEnum = appSchema.enum('integration_type', ['github']);

/**
 * Integration processing job status enum
 */
export const integrationProcessingStatusEnum = appSchema.enum('integration_processing_status', [
  'queued',
  'processing',
  'done',
  'failed',
]);

/**
 * Integration processing jobs table
 *
 * Tracks integration sync processing per person.
 * Stores metadata about data extracted and processed during a sync.
 *
 * One job per (person, integration) — upserted on each sync.
 */
export const integrationProcessingJobs = appSchema.table(
  'integration_processing_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Who was synced
    personId: uuid('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),

    // Which integration
    integration: integrationTypeEnum('integration').notNull(),

    // Job status
    status: integrationProcessingStatusEnum('status').default('queued').notNull(),

    // Processing timestamps
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),

    // Error details (if failed)
    error: text('error'),

    // Job metadata (JSON string with processing stats)
    metadata: text('metadata'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Index for querying pending jobs
    index('integration_processing_jobs_status_idx').on(table.status),
    // Index for querying person's jobs
    index('integration_processing_jobs_person_idx').on(table.personId),
    // Index for querying by integration type
    index('integration_processing_jobs_integration_idx').on(table.integration),
    // Index for upsert lookups (person + integration)
    index('integration_processing_jobs_person_integration_idx').on(table.personId, table.integration),
  ],
);

// Relations
export const integrationProcessingJobsRelations = relations(integrationProcessingJobs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [integrationProcessingJobs.tenantId],
    references: [tenants.id],
  }),
  person: one(persons, {
    fields: [integrationProcessingJobs.personId],
    references: [persons.id],
  }),
}));

// Types
export type IntegrationProcessingJob = typeof integrationProcessingJobs.$inferSelect;
export type NewIntegrationProcessingJob = typeof integrationProcessingJobs.$inferInsert;
