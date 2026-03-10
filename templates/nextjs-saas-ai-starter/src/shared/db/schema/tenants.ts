import { text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { appSchema } from './schema';

/**
 * Tenants table - Multi-tenancy support
 *
 * Each tenant represents an organization using Next.js SaaS AI Template.
 * All data is scoped to a tenant for isolation.
 *
 * Note: settings is stored as JSON text. Use parseTenantSettings() from
 * @/shared/lib/tenant-settings to parse it into the typed TenantSettings object.
 */
export const tenants = appSchema.table('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Settings (stored as JSON string, parsed via parseTenantSettings)
  settings: text('settings'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
