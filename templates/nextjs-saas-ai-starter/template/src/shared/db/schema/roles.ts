/**
 * Roles and Permissions Schema (PBAC / custom RBAC)
 *
 * Roles are tenant-scoped; permissions are resolved via role_permissions.
 * - permissions: tenant-scoped (or global) permission definitions
 * - roles: tenant-scoped roles with optional isSystem (member, manager, admin)
 * - role_permissions: which permissions each role has
 * - tenant_membership_roles (in auth.ts): which roles each membership has (multiple roles per user per tenant)
 */

import { relations } from 'drizzle-orm';
import { boolean, index, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { appSchema } from './schema';
import { tenants } from './tenants';

// ============================================================================
// PERMISSIONS
// ============================================================================

export const permissions = appSchema.table(
  'permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 128 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('permissions_tenant_idx').on(table.tenantId),
    index('permissions_tenant_key_idx').on(table.tenantId, table.key),
  ],
);

// ============================================================================
// ROLES
// ============================================================================

export const roles = appSchema.table(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 128 }).notNull(),
    slug: varchar('slug', { length: 128 }).notNull(),
    description: text('description'),
    isSystem: boolean('is_system').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('roles_tenant_idx').on(table.tenantId),
    index('roles_tenant_slug_idx').on(table.tenantId, table.slug),
  ],
);

// ============================================================================
// ROLE_PERMISSIONS (many-to-many)
// ============================================================================

export const rolePermissions = appSchema.table(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index('role_permissions_role_idx').on(table.roleId),
    index('role_permissions_permission_idx').on(table.permissionId),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

// ============================================================================
// TYPES
// ============================================================================

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
