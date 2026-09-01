import { relations } from 'drizzle-orm';
import { text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { tenantRoleEnum, users } from './auth';
import { roles } from './roles';
import { appSchema } from './schema';
import { tenants } from './tenants';

/**
 * Invitation status enum
 */
export const invitationStatusEnum = appSchema.enum('invitation_status', [
  'pending', // Invite sent, awaiting acceptance
  'accepted', // User accepted and joined
  'expired', // Invite expired without being used
  'revoked', // Admin revoked the invite
]);

/**
 * Tenant Invitations table
 *
 * Stores invite tokens for users to join a tenant.
 * Each invite has a unique token that can be used once.
 */
export const tenantInvitations = appSchema.table('tenant_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),

  // Invite details
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  role: tenantRoleEnum('role').default('member').notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),

  // Status
  status: invitationStatusEnum('status').default('pending').notNull(),

  // Who created the invite (users.id is text, not uuid)
  invitedByUserId: text('invited_by_user_id').references(() => users.id, { onDelete: 'set null' }),

  // Optional personalization
  message: text('message'),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  // Expiration
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

  // Acceptance tracking
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  acceptedByUserId: text('accepted_by_user_id').references(() => users.id, { onDelete: 'set null' }),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const tenantInvitationsRelations = relations(tenantInvitations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantInvitations.tenantId],
    references: [tenants.id],
  }),
  roleRef: one(roles, {
    fields: [tenantInvitations.roleId],
    references: [roles.id],
  }),
  invitedBy: one(users, {
    fields: [tenantInvitations.invitedByUserId],
    references: [users.id],
  }),
  acceptedBy: one(users, {
    fields: [tenantInvitations.acceptedByUserId],
    references: [users.id],
  }),
}));

// Types
export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type NewTenantInvitation = typeof tenantInvitations.$inferInsert;
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
