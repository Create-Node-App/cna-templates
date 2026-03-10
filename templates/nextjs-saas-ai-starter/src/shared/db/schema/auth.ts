/**
 * Auth Schema - Auth.js tables for authentication
 *
 * Using Drizzle adapter compatible schema.
 * @see https://authjs.dev/getting-started/adapters/drizzle
 */

import { relations } from 'drizzle-orm';
import { boolean, index, integer, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

import { persons } from './persons';
import { roles } from './roles';
import { appSchema } from './schema';
import { tenants } from './tenants';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Tenant role enum - defines access levels within a tenant
 * - member: Regular user, can view own profile, use assistant
 * - manager: Can view team reports and manage direct reports
 * - admin: Full tenant administration access
 */
export const tenantRoleEnum = appSchema.enum('tenant_role', ['member', 'manager', 'admin']);

// ============================================================================
// AUTH.JS TABLES
// ============================================================================

/**
 * Users table - Auth.js user records
 *
 * Links to persons table via email for Next.js SaaS AI Template-specific data
 */
export const users = appSchema.table('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
});

/**
 * Accounts table - OAuth provider accounts
 */
export const accounts = appSchema.table(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

/**
 * Sessions table - Active user sessions
 */
export const sessions = appSchema.table('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

/**
 * Verification tokens - Email verification, magic links
 */
export const verificationTokens = appSchema.table(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

/**
 * Authenticators table - WebAuthn/Passkeys
 */
export const authenticators = appSchema.table(
  'authenticators',
  {
    credentialID: text('credential_id').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('provider_account_id').notNull(),
    credentialPublicKey: text('credential_public_key').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credential_device_type').notNull(),
    credentialBackedUp: boolean('credential_backed_up').notNull(),
    transports: text('transports'),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

// ============================================================================
// TENANT MEMBERSHIPS (RBAC)
// ============================================================================

/**
 * Tenant memberships - Links Auth.js users to tenants with role-based access
 *
 * This is the core RBAC table that determines what a user can do within each tenant.
 * A user can have different roles in different tenants.
 * role enum is for display/backward compat; effective roles come from tenant_membership_roles.
 */
export const tenantMemberships = appSchema.table(
  'tenant_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    personId: uuid('person_id').references(() => persons.id, { onDelete: 'set null' }),
    role: tenantRoleEnum('role').notNull().default('member'),
    primaryRoleId: uuid('primary_role_id').references(() => roles.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('tenant_memberships_user_tenant_idx').on(table.userId, table.tenantId),
    index('tenant_memberships_tenant_idx').on(table.tenantId),
    index('tenant_memberships_user_idx').on(table.userId),
  ],
);

/**
 * Tenant membership roles - Multiple roles per user per tenant
 */
export const tenantMembershipRoles = appSchema.table(
  'tenant_membership_roles',
  {
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => tenantMemberships.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.membershipId, table.roleId] }),
    index('tenant_membership_roles_membership_idx').on(table.membershipId),
    index('tenant_membership_roles_role_idx').on(table.roleId),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  memberships: many(tenantMemberships),
}));

export const tenantMembershipsRelations = relations(tenantMemberships, ({ one, many }) => ({
  user: one(users, {
    fields: [tenantMemberships.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [tenantMemberships.tenantId],
    references: [tenants.id],
  }),
  person: one(persons, {
    fields: [tenantMemberships.personId],
    references: [persons.id],
  }),
  primaryRole: one(roles, {
    fields: [tenantMemberships.primaryRoleId],
    references: [roles.id],
  }),
  membershipRoles: many(tenantMembershipRoles),
}));

export const tenantMembershipRolesRelations = relations(tenantMembershipRoles, ({ one }) => ({
  membership: one(tenantMemberships, {
    fields: [tenantMembershipRoles.membershipId],
    references: [tenantMemberships.id],
  }),
  role: one(roles, {
    fields: [tenantMembershipRoles.roleId],
    references: [roles.id],
  }),
}));

// ============================================================================
// TYPES
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TenantMembership = typeof tenantMemberships.$inferSelect;
export type NewTenantMembership = typeof tenantMemberships.$inferInsert;
export type TenantMembershipRole = typeof tenantMembershipRoles.$inferSelect;
export type NewTenantMembershipRole = typeof tenantMembershipRoles.$inferInsert;
export type TenantRole = (typeof tenantRoleEnum.enumValues)[number];
