'use server';

/**
 * Roles and Permissions Admin Service
 *
 * Server actions for managing tenant roles and permissions (PBAC).
 */

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { logger } from '@/shared/lib/logger';
import { requireTenantAdmin } from '@/shared/lib/rbac';
import { isFeatureEnabled, parseTenantSettings } from '@/shared/lib/tenant-settings';

import type { AdminActionResult } from '../types';

export interface RoleWithPermissions {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  permissionIds: string[];
  permissionKeys: string[];
}

export interface PermissionForTenant {
  id: string;
  key: string;
  name: string;
  category: string | null;
}

export interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string;
  isSystem?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  slug?: string;
  description?: string;
  permissionIds?: string[];
}

export async function listRoles(tenantSlug: string): Promise<AdminActionResult<RoleWithPermissions[]>> {
  try {
    await requireTenantAdmin(tenantSlug);
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });
    if (!tenant) return { success: false, error: 'Tenant not found' };

    const roles = await db.query.roles.findMany({
      where: eq(schema.roles.tenantId, tenant.id),
      with: {
        rolePermissions: {
          columns: { permissionId: true },
        },
      },
    });

    const permissionIds = [...new Set(roles.flatMap((r) => r.rolePermissions.map((rp) => rp.permissionId)))];
    const perms =
      permissionIds.length > 0
        ? await db.query.permissions.findMany({
            where: inArray(schema.permissions.id, permissionIds),
            columns: { id: true, key: true },
          })
        : [];
    const permMap = new Map(perms.map((p) => [p.id, p.key]));

    const items: RoleWithPermissions[] = roles.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      slug: r.slug,
      description: r.description,
      isSystem: r.isSystem,
      permissionIds: r.rolePermissions.map((rp) => rp.permissionId),
      permissionKeys: r.rolePermissions.map((rp) => permMap.get(rp.permissionId)).filter(Boolean) as string[],
    }));

    return { success: true, data: items };
  } catch (error) {
    logger.error({ error }, 'Failed to list roles');
    return { success: false, error: 'Failed to list roles' };
  }
}

export async function getRole(tenantSlug: string, roleId: string): Promise<AdminActionResult<RoleWithPermissions>> {
  try {
    await requireTenantAdmin(tenantSlug);
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });
    if (!tenant) return { success: false, error: 'Tenant not found' };

    const role = await db.query.roles.findFirst({
      where: and(eq(schema.roles.id, roleId), eq(schema.roles.tenantId, tenant.id)),
      with: {
        rolePermissions: { columns: { permissionId: true } },
      },
    });
    if (!role) return { success: false, error: 'Role not found' };

    const permissionIds = role.rolePermissions.map((rp) => rp.permissionId);
    const perms =
      permissionIds.length > 0
        ? await db.query.permissions.findMany({
            where: inArray(schema.permissions.id, permissionIds),
            columns: { id: true, key: true },
          })
        : [];
    const permMap = new Map(perms.map((p) => [p.id, p.key]));

    return {
      success: true,
      data: {
        id: role.id,
        tenantId: role.tenantId,
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: role.isSystem,
        permissionIds: role.rolePermissions.map((rp) => rp.permissionId),
        permissionKeys: role.rolePermissions.map((rp) => permMap.get(rp.permissionId)).filter(Boolean) as string[],
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get role');
    return { success: false, error: 'Failed to get role' };
  }
}

export async function listPermissions(tenantSlug: string): Promise<AdminActionResult<PermissionForTenant[]>> {
  try {
    await requireTenantAdmin(tenantSlug);
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });
    if (!tenant) return { success: false, error: 'Tenant not found' };

    const perms = await db.query.permissions.findMany({
      where: eq(schema.permissions.tenantId, tenant.id),
      columns: { id: true, key: true, name: true, category: true },
    });

    return {
      success: true,
      data: perms.map((p) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        category: p.category,
      })),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to list permissions');
    return { success: false, error: 'Failed to list permissions' };
  }
}

export async function createRole(
  tenantSlug: string,
  input: CreateRoleInput,
): Promise<AdminActionResult<RoleWithPermissions>> {
  try {
    await requireTenantAdmin(tenantSlug);
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });
    if (!tenant) return { success: false, error: 'Tenant not found' };

    const settings = parseTenantSettings(tenant.settings);
    if (!isFeatureEnabled(settings, 'allowCustomRoles')) {
      return { success: false, error: 'Custom roles are disabled for this organization' };
    }

    const [role] = await db
      .insert(schema.roles)
      .values({
        tenantId: tenant.id,
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        isSystem: input.isSystem ?? false,
      })
      .returning();

    if (!role) return { success: false, error: 'Failed to create role' };

    if (input.permissionIds?.length) {
      await db
        .insert(schema.rolePermissions)
        .values(input.permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })));
    }

    revalidatePath(`/t/${tenantSlug}/admin/roles`);
    const result = await getRole(tenantSlug, role.id);
    return result;
  } catch (error) {
    logger.error({ error }, 'Failed to create role');
    return { success: false, error: 'Failed to create role' };
  }
}

export async function updateRole(
  tenantSlug: string,
  roleId: string,
  input: UpdateRoleInput,
): Promise<AdminActionResult<RoleWithPermissions>> {
  try {
    await requireTenantAdmin(tenantSlug);
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });
    if (!tenant) return { success: false, error: 'Tenant not found' };

    const existing = await db.query.roles.findFirst({
      where: and(eq(schema.roles.id, roleId), eq(schema.roles.tenantId, tenant.id)),
    });
    if (!existing) return { success: false, error: 'Role not found' };

    await db
      .update(schema.roles)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        updatedAt: new Date(),
      })
      .where(eq(schema.roles.id, roleId));

    if (input.description !== undefined) {
    }

    if (input.permissionIds !== undefined) {
      await db.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, roleId));
      if (input.permissionIds.length > 0) {
        await db
          .insert(schema.rolePermissions)
          .values(input.permissionIds.map((permissionId) => ({ roleId, permissionId })));
      }
    }

    revalidatePath(`/t/${tenantSlug}/admin/roles`);
    return getRole(tenantSlug, roleId);
  } catch (error) {
    logger.error({ error }, 'Failed to update role');
    return { success: false, error: 'Failed to update role' };
  }
}

export async function deleteRole(tenantSlug: string, roleId: string): Promise<AdminActionResult> {
  try {
    await requireTenantAdmin(tenantSlug);
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });
    if (!tenant) return { success: false, error: 'Tenant not found' };

    const role = await db.query.roles.findFirst({
      where: and(eq(schema.roles.id, roleId), eq(schema.roles.tenantId, tenant.id)),
    });
    if (!role) return { success: false, error: 'Role not found' };
    if (role.isSystem) return { success: false, error: 'Cannot delete system role' };

    await db.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, roleId));
    await db.delete(schema.roles).where(eq(schema.roles.id, roleId));

    revalidatePath(`/t/${tenantSlug}/admin/roles`);
    return { success: true };
  } catch (error) {
    logger.error({ error }, 'Failed to delete role');
    return { success: false, error: 'Failed to delete role' };
  }
}
