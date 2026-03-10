'use server';

/**
 * Tenant Invite Service
 *
 * Server actions for managing tenant invitations.
 */

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import type { TenantRole } from '@/shared/db/schema/auth';
import { logger } from '@/shared/lib/logger';
import { requireTenantAdmin } from '@/shared/lib/rbac';

import type { AdminActionResult, PaginatedResult } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface CreateInviteInput {
  email: string;
  role?: TenantRole;
  /** Role ID from tenant roles (initial role when accepting). Defaults to tenant "member" role if not provided. */
  roleId?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  expiresInDays?: number;
}

export interface InviteWithDetails {
  id: string;
  email: string;
  token: string;
  role: TenantRole;
  roleId?: string | null;
  roleName?: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  firstName: string | null;
  lastName: string | null;
  message: string | null;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  inviteUrl: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Build the invite URL
 */
function buildInviteUrl(tenantSlug: string, token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/t/${tenantSlug}/invite/${token}`;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Create a new invitation
 */
export async function createInvite(
  tenantSlug: string,
  input: CreateInviteInput,
): Promise<AdminActionResult<InviteWithDetails>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await db.query.tenantInvitations.findFirst({
      where: and(
        eq(schema.tenantInvitations.tenantId, tenant.id),
        eq(schema.tenantInvitations.email, input.email.toLowerCase()),
        eq(schema.tenantInvitations.status, 'pending'),
      ),
    });

    if (existingInvite) {
      return { success: false, error: 'An invitation for this email already exists' };
    }

    // Check if user is already a member
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email.toLowerCase()),
    });

    if (existingUser) {
      const existingMembership = await db.query.tenantMemberships.findFirst({
        where: and(
          eq(schema.tenantMemberships.tenantId, tenant.id),
          eq(schema.tenantMemberships.userId, existingUser.id),
        ),
      });

      if (existingMembership) {
        return { success: false, error: 'This email is already a member of this tenant' };
      }
    }

    // Generate token and calculate expiration
    const token = generateToken();
    const expiresInDays = input.expiresInDays ?? 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Check if the current user exists in users table (for FK constraint)
    const inviter = await db.query.users.findFirst({
      where: eq(schema.users.id, session.userId),
    });

    let role: TenantRole = input.role ?? 'member';
    let roleId: string | null = null;
    let roleName: string | null = null;

    if (input.roleId) {
      const roleRow = await db.query.roles.findFirst({
        where: and(eq(schema.roles.id, input.roleId), eq(schema.roles.tenantId, tenant.id)),
      });
      if (roleRow) {
        roleId = roleRow.id;
        roleName = roleRow.name;
        if (roleRow.slug === 'member' || roleRow.slug === 'manager' || roleRow.slug === 'admin') {
          role = roleRow.slug as TenantRole;
        }
      }
    } else {
      // Default to tenant "member" role so invite always has a roleId for acceptInvite
      const memberRole = await db.query.roles.findFirst({
        where: and(eq(schema.roles.tenantId, tenant.id), eq(schema.roles.slug, 'member')),
        columns: { id: true, name: true },
      });
      if (memberRole) {
        roleId = memberRole.id;
        roleName = memberRole.name;
        role = 'member';
      }
    }

    // Create invitation
    const [invite] = await db
      .insert(schema.tenantInvitations)
      .values({
        tenantId: tenant.id,
        email: input.email.toLowerCase(),
        token,
        role,
        roleId,
        firstName: input.firstName,
        lastName: input.lastName,
        message: input.message,
        expiresAt,
        invitedByUserId: inviter ? session.userId : null,
      })
      .returning();

    revalidatePath(`/t/${tenantSlug}/admin/members`);

    return {
      success: true,
      data: {
        id: invite.id,
        email: invite.email,
        token: invite.token,
        role: invite.role as TenantRole,
        roleId: invite.roleId ?? undefined,
        roleName: roleName ?? undefined,
        status: invite.status as 'pending' | 'accepted' | 'expired' | 'revoked',
        firstName: invite.firstName,
        lastName: invite.lastName,
        message: invite.message,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        invitedBy: inviter
          ? {
              id: inviter.id,
              name: inviter.name,
              email: inviter.email,
            }
          : null,
        inviteUrl: buildInviteUrl(tenantSlug, invite.token),
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to create invite');
    return { success: false, error: 'Failed to create invite' };
  }
}

/**
 * List all invitations for a tenant
 */
export async function listInvites(
  tenantSlug: string,
  params: { page?: number; pageSize?: number; status?: 'pending' | 'all' } = {},
): Promise<AdminActionResult<PaginatedResult<InviteWithDetails>>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { page = 1, pageSize = 20, status = 'all' } = params;

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Build where clause
    const whereConditions = [eq(schema.tenantInvitations.tenantId, tenant.id)];
    if (status === 'pending') {
      whereConditions.push(eq(schema.tenantInvitations.status, 'pending'));
    }

    const invites = await db.query.tenantInvitations.findMany({
      where: and(...whereConditions),
      with: {
        invitedBy: true,
        roleRef: true,
      },
      orderBy: [desc(schema.tenantInvitations.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // Mark expired invites
    const now = new Date();
    const items: InviteWithDetails[] = invites.map((invite) => {
      const isExpired = invite.status === 'pending' && invite.expiresAt < now;
      return {
        id: invite.id,
        email: invite.email,
        token: invite.token,
        role: invite.role as TenantRole,
        roleId: invite.roleId ?? undefined,
        roleName: invite.roleRef?.name ?? undefined,
        status: isExpired ? 'expired' : (invite.status as 'pending' | 'accepted' | 'expired' | 'revoked'),
        firstName: invite.firstName,
        lastName: invite.lastName,
        message: invite.message,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        invitedBy: invite.invitedBy
          ? {
              id: invite.invitedBy.id,
              name: invite.invitedBy.name,
              email: invite.invitedBy.email,
            }
          : null,
        inviteUrl: buildInviteUrl(tenantSlug, invite.token),
      };
    });

    return {
      success: true,
      data: {
        items,
        total: items.length,
        page,
        pageSize,
        totalPages: 1,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to list invites');
    return { success: false, error: 'Failed to list invites' };
  }
}

/**
 * Revoke an invitation
 */
export async function revokeInvite(tenantSlug: string, inviteId: string): Promise<AdminActionResult> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const invite = await db.query.tenantInvitations.findFirst({
      where: and(eq(schema.tenantInvitations.id, inviteId), eq(schema.tenantInvitations.tenantId, tenant.id)),
    });

    if (!invite) {
      return { success: false, error: 'Invite not found' };
    }

    if (invite.status !== 'pending') {
      return { success: false, error: 'Only pending invites can be revoked' };
    }

    await db
      .update(schema.tenantInvitations)
      .set({ status: 'revoked', updatedAt: new Date() })
      .where(eq(schema.tenantInvitations.id, inviteId));

    revalidatePath(`/t/${tenantSlug}/admin/members`);

    return { success: true };
  } catch (error) {
    logger.error({ error }, 'Failed to revoke invite');
    return { success: false, error: 'Failed to revoke invite' };
  }
}

/**
 * Resend an invitation (creates new token)
 */
export async function resendInvite(
  tenantSlug: string,
  inviteId: string,
): Promise<AdminActionResult<InviteWithDetails>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const invite = await db.query.tenantInvitations.findFirst({
      where: and(eq(schema.tenantInvitations.id, inviteId), eq(schema.tenantInvitations.tenantId, tenant.id)),
      with: { invitedBy: true, roleRef: true },
    });

    if (!invite) {
      return { success: false, error: 'Invite not found' };
    }

    // Generate new token and extend expiration
    const newToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [updated] = await db
      .update(schema.tenantInvitations)
      .set({
        token: newToken,
        expiresAt,
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(schema.tenantInvitations.id, inviteId))
      .returning();

    revalidatePath(`/t/${tenantSlug}/admin/members`);

    return {
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        token: updated.token,
        role: updated.role as TenantRole,
        roleId: updated.roleId ?? undefined,
        roleName: invite.roleRef?.name ?? undefined,
        status: 'pending',
        firstName: updated.firstName,
        lastName: updated.lastName,
        message: updated.message,
        expiresAt: updated.expiresAt,
        createdAt: updated.createdAt,
        invitedBy: invite.invitedBy
          ? {
              id: invite.invitedBy.id,
              name: invite.invitedBy.name,
              email: invite.invitedBy.email,
            }
          : null,
        inviteUrl: buildInviteUrl(tenantSlug, updated.token),
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to resend invite');
    return { success: false, error: 'Failed to resend invite' };
  }
}

/**
 * Validate an invite token (for the accept flow)
 */
export async function validateInviteToken(
  tenantSlug: string,
  token: string,
): Promise<
  AdminActionResult<{
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: TenantRole;
    tenantName: string;
    message: string | null;
  }>
> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const invite = await db.query.tenantInvitations.findFirst({
      where: and(eq(schema.tenantInvitations.token, token), eq(schema.tenantInvitations.tenantId, tenant.id)),
    });

    if (!invite) {
      return { success: false, error: 'Invalid invitation link' };
    }

    if (invite.status !== 'pending') {
      return { success: false, error: `This invitation has already been ${invite.status}` };
    }

    if (invite.expiresAt < new Date()) {
      return { success: false, error: 'This invitation has expired' };
    }

    return {
      success: true,
      data: {
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        role: invite.role as TenantRole,
        tenantName: tenant.name,
        message: invite.message,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to validate invite');
    return { success: false, error: 'Failed to validate invitation' };
  }
}

/**
 * Accept an invite (called after user signs in)
 */
export async function acceptInvite(tenantSlug: string, token: string, userId: string): Promise<AdminActionResult> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const invite = await db.query.tenantInvitations.findFirst({
      where: and(
        eq(schema.tenantInvitations.token, token),
        eq(schema.tenantInvitations.tenantId, tenant.id),
        eq(schema.tenantInvitations.status, 'pending'),
      ),
    });

    if (!invite) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    if (invite.expiresAt < new Date()) {
      return { success: false, error: 'This invitation has expired' };
    }

    // Get the user
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify email matches
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return { success: false, error: 'This invitation was sent to a different email address' };
    }

    // Check if already a member
    const existingMembership = await db.query.tenantMemberships.findFirst({
      where: and(eq(schema.tenantMemberships.tenantId, tenant.id), eq(schema.tenantMemberships.userId, userId)),
    });

    if (existingMembership) {
      // Update invite status anyway
      await db
        .update(schema.tenantInvitations)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
          acceptedByUserId: userId,
          updatedAt: new Date(),
        })
        .where(eq(schema.tenantInvitations.id, invite.id));

      return { success: true }; // Already a member, just accept the invite
    }

    // Resolve roleId for tenant_membership_roles: use invite.roleId or default to tenant "member" role
    let roleIdForMembership = invite.roleId;
    if (!roleIdForMembership) {
      const memberRole = await db.query.roles.findFirst({
        where: and(eq(schema.roles.tenantId, tenant.id), eq(schema.roles.slug, 'member')),
        columns: { id: true },
      });
      roleIdForMembership = memberRole?.id ?? null;
    }

    const [membership] = await db
      .insert(schema.tenantMemberships)
      .values({
        tenantId: tenant.id,
        userId,
        role: invite.role as TenantRole,
        primaryRoleId: roleIdForMembership ?? undefined,
      })
      .returning();

    if (membership && roleIdForMembership) {
      await db.insert(schema.tenantMembershipRoles).values({
        membershipId: membership.id,
        roleId: roleIdForMembership,
      });
    }

    // Create person record
    await db.insert(schema.persons).values({
      tenantId: tenant.id,
      email: invite.email,
      firstName: invite.firstName || user.name?.split(' ')[0] || 'New',
      lastName: invite.lastName || user.name?.split(' ').slice(1).join(' ') || 'Member',
      status: 'onboarding',
      profileInitialized: false,
    });

    // Update invite status
    await db
      .update(schema.tenantInvitations)
      .set({
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedByUserId: userId,
        updatedAt: new Date(),
      })
      .where(eq(schema.tenantInvitations.id, invite.id));

    return { success: true };
  } catch (error) {
    logger.error({ error }, 'Failed to accept invite');
    return { success: false, error: 'Failed to accept invitation' };
  }
}
