/**
 * Permissions layer (PBAC) – permission-based access.
 *
 * Authorization is always resolved from tenant_membership_roles → role_permissions → permissions.
 * A person can have multiple roles per tenant; effective permissions are the union of all their roles' permissions.
 * Every membership must have at least one row in tenant_membership_roles (enforced by invite/seed flows).
 */

import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import type { Role } from '@/shared/db/schema/roles';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get effective permission keys for a user in a tenant (union of all roles assigned to that membership).
 * A person can have multiple roles; we resolve all role IDs from tenant_membership_roles and aggregate permissions.
 */
async function getEffectivePermissionKeys(tenantSlug: string, userId: string): Promise<Set<string>> {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return new Set();

  const membership = await db.query.tenantMemberships.findFirst({
    where: and(eq(schema.tenantMemberships.tenantId, tenant.id), eq(schema.tenantMemberships.userId, userId)),
    columns: { id: true },
  });
  if (!membership) return new Set();

  const membershipRoles = await db.query.tenantMembershipRoles.findMany({
    where: eq(schema.tenantMembershipRoles.membershipId, membership.id),
    columns: { roleId: true },
  });
  const roleIds = membershipRoles.map((r) => r.roleId);

  if (roleIds.length === 0) return new Set();

  const rp = await db.query.rolePermissions.findMany({
    where: inArray(schema.rolePermissions.roleId, roleIds),
    columns: { permissionId: true },
  });
  const permissionIds = [...new Set(rp.map((r) => r.permissionId))];
  if (permissionIds.length === 0) return new Set();

  const perms = await db.query.permissions.findMany({
    where: and(
      inArray(schema.permissions.id, permissionIds),
      or(eq(schema.permissions.tenantId, tenant.id), isNull(schema.permissions.tenantId)),
    ),
    columns: { key: true },
  });

  return new Set(perms.map((p) => p.key));
}

/**
 * Get permission keys for all tenants the user belongs to (batch, fixed number of queries).
 * Used only from auth callbacks to populate session.user.permissions.
 * Each person can have multiple roles per tenant; we aggregate permissions from all their roles.
 */
export async function getAllTenantPermissionsForUser(userId: string): Promise<Record<string, string[]>> {
  const memberships = await db.query.tenantMemberships.findMany({
    where: eq(schema.tenantMemberships.userId, userId),
    columns: { id: true },
    with: { tenant: { columns: { slug: true, id: true } } },
  });
  if (memberships.length === 0) return {};

  const membershipIds = memberships.map((m) => m.id);
  const tenantIds = [...new Set(memberships.map((m) => m.tenant.id))];

  const membershipRoles = await db.query.tenantMembershipRoles.findMany({
    where: inArray(schema.tenantMembershipRoles.membershipId, membershipIds),
    columns: { membershipId: true, roleId: true },
  });
  const roleIdsByMembershipId = new Map<string, string[]>();
  for (const r of membershipRoles) {
    const arr = roleIdsByMembershipId.get(r.membershipId) ?? [];
    arr.push(r.roleId);
    roleIdsByMembershipId.set(r.membershipId, arr);
  }
  const allRoleIds = [...new Set(membershipRoles.map((r) => r.roleId))];
  if (allRoleIds.length === 0) {
    return Object.fromEntries(memberships.map((m) => [m.tenant.slug, []]));
  }

  const rpRows = await db.query.rolePermissions.findMany({
    where: inArray(schema.rolePermissions.roleId, allRoleIds),
    columns: { roleId: true, permissionId: true },
  });
  const permissionIdsByRoleId = new Map<string, string[]>();
  for (const row of rpRows) {
    const arr = permissionIdsByRoleId.get(row.roleId) ?? [];
    arr.push(row.permissionId);
    permissionIdsByRoleId.set(row.roleId, arr);
  }
  const allPermissionIds = [...new Set(rpRows.map((r) => r.permissionId))];
  if (allPermissionIds.length === 0) {
    return Object.fromEntries(memberships.map((m) => [m.tenant.slug, []]));
  }

  const permsRows = await db.query.permissions.findMany({
    where: and(
      inArray(schema.permissions.id, allPermissionIds),
      or(inArray(schema.permissions.tenantId, tenantIds), isNull(schema.permissions.tenantId)),
    ),
    columns: { id: true, key: true, tenantId: true },
  });
  const permKeyById = new Map(permsRows.map((p) => [p.id, p.key]));
  const permTenantById = new Map(permsRows.map((p) => [p.id, p.tenantId]));

  const result: Record<string, string[]> = {};
  for (const m of memberships) {
    const tenantSlug = m.tenant.slug;
    const roleIdsForMember = roleIdsByMembershipId.get(m.id) ?? [];
    if (roleIdsForMember.length === 0) {
      result[tenantSlug] = [];
      continue;
    }
    const keysSet = new Set<string>();
    for (const roleId of roleIdsForMember) {
      const permIds = permissionIdsByRoleId.get(roleId) ?? [];
      for (const pid of permIds) {
        const key = permKeyById.get(pid);
        if (!key) continue;
        const permTenantId = permTenantById.get(pid);
        if (permTenantId === null || permTenantId === m.tenant.id) keysSet.add(key);
      }
    }
    result[tenantSlug] = [...keysSet];
  }
  return result;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Check if the current user has the given permission in the tenant.
 * Always resolves via DB (getEffectivePermissionKeys). Do not use session.user.permissions for API authorization.
 */
export async function hasPermission(tenantSlug: string, permissionKey: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const keys = await getEffectivePermissionKeys(tenantSlug, session.user.id);
  return keys.has(permissionKey);
}

/**
 * Require the current user to have the given permission; redirect if not.
 */
export async function requirePermission(
  tenantSlug: string,
  permissionKey: string,
): Promise<{ userId: string; email: string }> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    redirect('/login');
  }
  const allowed = await hasPermission(tenantSlug, permissionKey);
  if (!allowed) {
    redirect(`/t/${tenantSlug}?error=unauthorized`);
  }
  return { userId: session.user.id, email: session.user.email };
}

/**
 * Get current user's role IDs in the tenant.
 */
export async function getCurrentRoleIds(tenantSlug: string): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return [];

  const membership = await db.query.tenantMemberships.findFirst({
    where: and(eq(schema.tenantMemberships.tenantId, tenant.id), eq(schema.tenantMemberships.userId, session.user.id)),
    columns: { id: true },
  });
  if (!membership) return [];

  const membershipRoles = await db.query.tenantMembershipRoles.findMany({
    where: eq(schema.tenantMembershipRoles.membershipId, membership.id),
    columns: { roleId: true },
  });
  return membershipRoles.map((r) => r.roleId);
}

/**
 * Get current user's roles (with details) in the tenant.
 */
export async function getCurrentRoles(tenantSlug: string): Promise<Role[]> {
  const roleIds = await getCurrentRoleIds(tenantSlug);
  if (roleIds.length === 0) return [];

  const rolesList = await db.query.roles.findMany({
    where: inArray(schema.roles.id, roleIds),
  });
  return rolesList as Role[];
}

/**
 * Get the list of permission keys the current user has in the tenant.
 * When session.user.permissions is already set (from auth callback), returns that to avoid extra DB; otherwise resolves via getEffectivePermissionKeys.
 * Used by layouts/sidebars for conditional nav. API authorization must always use hasPermission() against DB.
 */
export async function getCurrentUserPermissions(tenantSlug: string): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const fromSession = session.user.permissions?.[tenantSlug];
  if (fromSession) return fromSession;
  const keys = await getEffectivePermissionKeys(tenantSlug, session.user.id);
  return [...keys];
}

// NOTE: UI helpers for sidebar visibility (canShowNav, canShowNavAny) are in
// src/shared/lib/permissions-ui.ts to avoid importing server code in client components.
