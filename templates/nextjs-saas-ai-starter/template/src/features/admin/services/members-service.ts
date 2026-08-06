'use server';

/**
 * Team Members Admin Service
 *
 * Server actions for managing tenant memberships.
 */

import { and, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { logger } from '@/shared/lib/logger';
import { requireTenantAdmin } from '@/shared/lib/rbac';
import { getTenantBySlug } from '@/shared/lib/tenant';

import type {
  AdminActionResult,
  AdminListParams,
  GetAvailableRolesResult,
  InviteMemberInput,
  MemberWithDetails,
  PaginatedResult,
  UpdateMemberInput,
} from '../types';

/**
 * List team members with pagination and search
 */
export async function listMembers(
  tenantSlug: string,
  params: Omit<AdminListParams, 'tenantId'> = {},
): Promise<AdminActionResult<PaginatedResult<MemberWithDetails>>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { page = 1, pageSize = 20, search } = params;

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Get memberships with user and person details
    const memberships = await db.query.tenantMemberships.findMany({
      where: eq(schema.tenantMemberships.tenantId, tenant.id),
      with: {
        user: true,
        person: true,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(schema.tenantMemberships)
      .where(eq(schema.tenantMemberships.tenantId, tenant.id));

    // Filter by search if provided
    let filteredMemberships = memberships;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMemberships = memberships.filter(
        (m) =>
          m.user?.email?.toLowerCase().includes(searchLower) ||
          m.user?.name?.toLowerCase().includes(searchLower) ||
          m.person?.firstName?.toLowerCase().includes(searchLower) ||
          m.person?.lastName?.toLowerCase().includes(searchLower),
      );
    }

    const items: MemberWithDetails[] = filteredMemberships.map((m) => ({
      ...m,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      },
      person: m.person
        ? {
            id: m.person.id,
            firstName: m.person.firstName,
            lastName: m.person.lastName,
            title: m.person.title,
          }
        : null,
    }));

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to list members:');
    return { success: false, error: 'Failed to list members' };
  }
}

/** Person summary for relations dialog (manager, 1:1er, mentor, teacher picker) */
export interface TenantPersonSummary {
  id: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
}

/**
 * List all persons in the tenant for use in PersonRelationsDialog (availablePersons).
 * Admin only.
 */
export async function listTenantPersonsForRelations(
  tenantSlug: string,
): Promise<AdminActionResult<TenantPersonSummary[]>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
      columns: { id: true },
    });
    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const persons = await db.query.persons.findMany({
      where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.status, 'active')),
      columns: { id: true, displayName: true, email: true, avatarUrl: true },
    });

    const items: TenantPersonSummary[] = persons.map((p) => ({
      id: p.id,
      displayName: p.displayName ?? null,
      email: p.email,
      avatarUrl: p.avatarUrl ?? null,
    }));

    return { success: true, data: items };
  } catch (error) {
    logger.error({ error }, 'Failed to list tenant persons for relations');
    return { success: false, error: 'Failed to list persons' };
  }
}

/**
 * Invite a new member (creates user if needed and membership)
 */
export async function inviteMember(
  tenantSlug: string,
  input: InviteMemberInput,
): Promise<AdminActionResult<MemberWithDetails>> {
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

    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email),
    });

    if (!user) {
      const [newUser] = await db
        .insert(schema.users)
        .values({
          email: input.email,
          name: input.email.split('@')[0],
        })
        .returning();
      user = newUser;
    }

    // Check if membership already exists
    const existingMembership = await db.query.tenantMemberships.findFirst({
      where: and(eq(schema.tenantMemberships.tenantId, tenant.id), eq(schema.tenantMemberships.userId, user.id)),
    });

    if (existingMembership) {
      return { success: false, error: 'User is already a member of this tenant' };
    }

    // Create membership
    const [membership] = await db
      .insert(schema.tenantMemberships)
      .values({
        tenantId: tenant.id,
        userId: user.id,
        role: input.role,
      })
      .returning();

    revalidatePath(`/t/${tenantSlug}/admin/settings`);

    return {
      success: true,
      data: {
        ...membership,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        person: null,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to invite member:');
    return { success: false, error: 'Failed to invite member' };
  }
}

/**
 * Update a member's role
 */
export async function updateMember(
  tenantSlug: string,
  membershipId: string,
  input: UpdateMemberInput,
): Promise<AdminActionResult<MemberWithDetails>> {
  const authResult = await requireTenantAdmin(tenantSlug);
  if (!authResult) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Don't allow changing own role (to prevent locking out)
    const membership = await db.query.tenantMemberships.findFirst({
      where: eq(schema.tenantMemberships.id, membershipId),
      with: { user: true },
    });

    if (!membership) {
      return { success: false, error: 'Membership not found' };
    }

    if (membership.userId === authResult.userId) {
      return { success: false, error: 'Cannot change your own role' };
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });
    if (!tenant) return { success: false, error: 'Tenant not found' };

    if (input.roleIds !== undefined) {
      await db.delete(schema.tenantMembershipRoles).where(eq(schema.tenantMembershipRoles.membershipId, membershipId));
      if (input.roleIds.length > 0) {
        await db.insert(schema.tenantMembershipRoles).values(input.roleIds.map((roleId) => ({ membershipId, roleId })));
      }
      const primaryRoleId = input.roleIds[0] ?? null;
      await db
        .update(schema.tenantMemberships)
        .set({ primaryRoleId, ...(input.role !== undefined && { role: input.role }) })
        .where(eq(schema.tenantMemberships.id, membershipId));
    } else if (input.role !== undefined) {
      await db
        .update(schema.tenantMemberships)
        .set({ role: input.role })
        .where(eq(schema.tenantMemberships.id, membershipId));
    }

    const [updated] = await db
      .select()
      .from(schema.tenantMemberships)
      .where(eq(schema.tenantMemberships.id, membershipId))
      .limit(1);

    revalidatePath(`/t/${tenantSlug}/admin/settings`);

    if (!updated) return { success: false, error: 'Failed to update member' };

    return {
      success: true,
      data: {
        ...updated,
        user: {
          id: membership.user.id,
          name: membership.user.name,
          email: membership.user.email,
          image: membership.user.image,
        },
        person: null,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to update member:');
    return { success: false, error: 'Failed to update member' };
  }
}

/**
 * Remove a member from the tenant
 */
export async function removeMember(tenantSlug: string, membershipId: string): Promise<AdminActionResult> {
  const authResult = await requireTenantAdmin(tenantSlug);
  if (!authResult) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Don't allow removing self
    const membership = await db.query.tenantMemberships.findFirst({
      where: eq(schema.tenantMemberships.id, membershipId),
    });

    if (!membership) {
      return { success: false, error: 'Membership not found' };
    }

    if (membership.userId === authResult.userId) {
      return { success: false, error: 'Cannot remove yourself from the tenant' };
    }

    await db.delete(schema.tenantMemberships).where(eq(schema.tenantMemberships.id, membershipId));

    revalidatePath(`/t/${tenantSlug}/admin/settings`);

    return { success: true };
  } catch (error) {
    logger.error({ error }, 'Failed to remove member:');
    return { success: false, error: 'Failed to remove member' };
  }
}

/**
 * Get current role IDs for a membership
 */
export async function getMemberRoleIds(tenantSlug: string, membershipId: string): Promise<AdminActionResult<string[]>> {
  try {
    await requireTenantAdmin(tenantSlug);
    const rows = await db.query.tenantMembershipRoles.findMany({
      where: eq(schema.tenantMembershipRoles.membershipId, membershipId),
      columns: { roleId: true },
    });
    return { success: true, data: rows.map((r) => r.roleId) };
  } catch (error) {
    logger.error({ error }, 'Failed to get member role IDs');
    return { success: false, error: 'Failed to get member role IDs' };
  }
}

/**
 * Get available roles for the tenant (from DB)
 */
export async function getAvailableRoles(tenantSlug: string): Promise<AdminActionResult<GetAvailableRolesResult>> {
  try {
    await requireTenantAdmin(tenantSlug);
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return { success: false, error: 'Tenant not found' };
    const roles = await db.query.roles.findMany({
      where: eq(schema.roles.tenantId, tenant.id),
      columns: { id: true, name: true, slug: true, description: true, isSystem: true },
    });
    return {
      success: true,
      data: {
        roles: roles.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          isSystem: r.isSystem,
        })),
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get roles:');
    return { success: false, error: 'Failed to get roles' };
  }
}
