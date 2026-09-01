import { relations } from 'drizzle-orm';
import { boolean, index, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { persons } from './persons';
import { appSchema } from './schema';
import { tenants } from './tenants';

/**
 * Department managers table
 *
 * Links managers to departments. A department can have multiple managers,
 * with one marked as primary. Supports historical tracking with start/end dates.
 *
 * Note: department_id references tenant_settings.departments.list[].id (string),
 * not a separate departments table, as departments are stored in tenant settings.
 */
export const departmentManagers = appSchema.table(
  'department_managers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Department ID from tenant settings (string reference)
    departmentId: text('department_id').notNull(),

    // Manager (person who manages the department)
    managerId: uuid('manager_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),

    // Primary manager flag (one per department)
    isPrimary: boolean('is_primary').default(true).notNull(),

    // Active period
    startDate: timestamp('start_date', { withTimezone: true }).defaultNow().notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Index for finding managers of a department
    index('department_managers_department_idx').on(table.tenantId, table.departmentId),
    // Index for finding departments managed by a person
    index('department_managers_manager_idx').on(table.tenantId, table.managerId),
  ],
);

// Relations
export const departmentManagersRelations = relations(departmentManagers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [departmentManagers.tenantId],
    references: [tenants.id],
  }),
  manager: one(persons, {
    fields: [departmentManagers.managerId],
    references: [persons.id],
  }),
}));

// Types
export type DepartmentManager = typeof departmentManagers.$inferSelect;
export type NewDepartmentManager = typeof departmentManagers.$inferInsert;
