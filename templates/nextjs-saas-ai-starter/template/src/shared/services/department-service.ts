'use server';

import { and, eq, isNull, or, sql } from 'drizzle-orm';

import { getTenantSettings, updateTenantSettings } from '@/features/admin/services/settings-service';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { type Department } from '@/shared/lib/tenant-settings';

// ============================================================================
// Types
// ============================================================================

export interface DepartmentWithMembers extends Department {
  memberCount: number;
  managerIds: string[];
}

export interface DepartmentMember {
  id: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  title: string | null;
  departmentId: string | null;
}

export interface DepartmentManager {
  id: string;
  managerId: string;
  managerName: string | null;
  managerEmail: string;
  isPrimary: boolean;
  startDate: Date;
  endDate: Date | null;
}

// ============================================================================
// Get Departments
// ============================================================================

/**
 * Get all departments for a tenant
 */
export async function getDepartments(
  tenantSlug: string,
): Promise<{ success: boolean; data?: Department[]; error?: string }> {
  try {
    const settings = await getTenantSettings(tenantSlug);
    const departments = settings.departments?.list ?? [];

    return { success: true, data: departments };
  } catch (error) {
    console.error('Failed to get departments:', error);
    return { success: false, error: 'Failed to get departments' };
  }
}

/**
 * Get departments with member counts and manager info
 */
export async function getDepartmentsWithDetails(
  tenantSlug: string,
): Promise<{ success: boolean; data?: DepartmentWithMembers[]; error?: string }> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const settings = await getTenantSettings(tenantSlug);
    const departments = settings.departments?.list ?? [];

    // Get member counts
    const persons = await db.query.persons.findMany({
      where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.status, 'active')),
      columns: {
        id: true,
        departmentId: true,
      },
    });

    // Get department managers
    const departmentManagers = await db.query.departmentManagers.findMany({
      where: and(
        eq(schema.departmentManagers.tenantId, tenant.id),
        or(isNull(schema.departmentManagers.endDate), sql`${schema.departmentManagers.endDate} > NOW()`),
      ),
      columns: {
        departmentId: true,
        managerId: true,
        isPrimary: true,
      },
    });

    const departmentsWithDetails: DepartmentWithMembers[] = departments.map((dept: Department) => {
      const memberCount = persons.filter((p) => p.departmentId === dept.id).length;
      const managers = departmentManagers.filter((dm) => dm.departmentId === dept.id).map((dm) => dm.managerId);

      return {
        ...dept,
        memberCount,
        managerIds: managers,
      };
    });

    return { success: true, data: departmentsWithDetails };
  } catch (error) {
    console.error('Failed to get departments with details:', error);
    return { success: false, error: 'Failed to get departments with details' };
  }
}

// ============================================================================
// Get Department Members
// ============================================================================

/**
 * Get all members of a department
 */
export async function getDepartmentMembers(
  tenantSlug: string,
  departmentId: string,
): Promise<{ success: boolean; data?: DepartmentMember[]; error?: string }> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Verify department exists
    const settings = await getTenantSettings(tenantSlug);
    const department = settings.departments?.list?.find((d: Department) => d.id === departmentId);

    if (!department) {
      return { success: false, error: 'Department not found' };
    }

    const members = await db.query.persons.findMany({
      where: and(
        eq(schema.persons.tenantId, tenant.id),
        eq(schema.persons.departmentId, departmentId),
        eq(schema.persons.status, 'active'),
      ),
      columns: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        title: true,
        departmentId: true,
      },
      orderBy: (fields, { asc }) => [asc(fields.lastName), asc(fields.firstName)],
    });

    return {
      success: true,
      data: members.map((m) => ({
        id: m.id,
        displayName: m.displayName,
        email: m.email,
        avatarUrl: m.avatarUrl,
        title: m.title,
        departmentId: m.departmentId,
      })),
    };
  } catch (error) {
    console.error('Failed to get department members:', error);
    return { success: false, error: 'Failed to get department members' };
  }
}

// ============================================================================
// Get Department Manager
// ============================================================================

/**
 * Get manager(s) for a department
 */
export async function getDepartmentManager(
  tenantSlug: string,
  departmentId: string,
): Promise<{ success: boolean; data?: DepartmentManager[]; error?: string }> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const managers = await db.query.departmentManagers.findMany({
      where: and(
        eq(schema.departmentManagers.tenantId, tenant.id),
        eq(schema.departmentManagers.departmentId, departmentId),
        or(isNull(schema.departmentManagers.endDate), sql`${schema.departmentManagers.endDate} > NOW()`),
      ),
      with: {
        manager: {
          columns: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: (fields, { desc }) => [desc(fields.isPrimary)],
    });

    return {
      success: true,
      data: managers.map((dm) => ({
        id: dm.id,
        managerId: dm.managerId,
        managerName: dm.manager.displayName,
        managerEmail: dm.manager.email,
        isPrimary: dm.isPrimary,
        startDate: dm.startDate,
        endDate: dm.endDate,
      })),
    };
  } catch (error) {
    console.error('Failed to get department manager:', error);
    return { success: false, error: 'Failed to get department manager' };
  }
}

// ============================================================================
// Create Department
// ============================================================================

/**
 * Create a new department
 */
export async function createDepartment(
  tenantSlug: string,
  departmentData: Omit<Department, 'id'>,
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    const settings = await getTenantSettings(tenantSlug);
    const departments = settings.departments?.list ?? [];

    // Generate ID
    const id = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newDepartment: Department = {
      id,
      ...departmentData,
    };

    // Add to list
    await updateTenantSettings(tenantSlug, {
      departments: {
        list: [...departments, newDepartment],
      },
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error('Failed to create department:', error);
    return { success: false, error: 'Failed to create department' };
  }
}

// ============================================================================
// Update Department
// ============================================================================

/**
 * Update a department
 */
export async function updateDepartment(
  tenantSlug: string,
  departmentId: string,
  updates: Partial<Omit<Department, 'id'>>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getTenantSettings(tenantSlug);
    const departments = settings.departments?.list ?? [];

    const index = departments.findIndex((d: Department) => d.id === departmentId);
    if (index === -1) {
      return { success: false, error: 'Department not found' };
    }

    // Update department
    const updatedDepartment: Department = {
      ...departments[index],
      ...updates,
    };

    const updatedList = [...departments];
    updatedList[index] = updatedDepartment;

    await updateTenantSettings(tenantSlug, {
      departments: {
        list: updatedList,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update department:', error);
    return { success: false, error: 'Failed to update department' };
  }
}

// ============================================================================
// Delete Department
// ============================================================================

/**
 * Delete a department
 * Note: This does not remove department_id from persons. That should be handled separately.
 */
export async function deleteDepartment(
  tenantSlug: string,
  departmentId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Check if department has members
    const members = await db.query.persons.findMany({
      where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.departmentId, departmentId)),
      columns: {
        id: true,
      },
      limit: 1,
    });

    if (members.length > 0) {
      return { success: false, error: 'Cannot delete department with members. Please reassign members first.' };
    }

    // Remove from settings
    const settings = await getTenantSettings(tenantSlug);
    const departments = settings.departments?.list ?? [];

    const updatedList = departments.filter((d: Department) => d.id !== departmentId);

    await updateTenantSettings(tenantSlug, {
      departments: {
        list: updatedList,
      },
    });

    // End all department manager relationships
    await db
      .update(schema.departmentManagers)
      .set({
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.departmentManagers.tenantId, tenant.id),
          eq(schema.departmentManagers.departmentId, departmentId),
          isNull(schema.departmentManagers.endDate),
        ),
      );

    return { success: true };
  } catch (error) {
    console.error('Failed to delete department:', error);
    return { success: false, error: 'Failed to delete department' };
  }
}

// ============================================================================
// Assign Person to Department
// ============================================================================

/**
 * Assign a person to a department
 */
export async function assignPersonToDepartment(
  tenantSlug: string,
  personId: string,
  departmentId: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Verify person exists and belongs to tenant
    const person = await db.query.persons.findFirst({
      where: and(eq(schema.persons.id, personId), eq(schema.persons.tenantId, tenant.id)),
      columns: {
        id: true,
      },
    });

    if (!person) {
      return { success: false, error: 'Person not found' };
    }

    // If departmentId provided, verify it exists
    if (departmentId) {
      const settings = await getTenantSettings(tenantSlug);
      const department = settings.departments?.list?.find((d: Department) => d.id === departmentId);

      if (!department) {
        return { success: false, error: 'Department not found' };
      }
    }

    // Update person's department
    await db
      .update(schema.persons)
      .set({
        departmentId: departmentId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.persons.id, personId));

    return { success: true };
  } catch (error) {
    console.error('Failed to assign person to department:', error);
    return { success: false, error: 'Failed to assign person to department' };
  }
}

// ============================================================================
// Assign Manager to Department
// ============================================================================

/**
 * Assign a manager to a department
 */
export async function assignManagerToDepartment(
  tenantSlug: string,
  departmentId: string,
  managerId: string,
  isPrimary = false,
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Verify department exists
    const settings = await getTenantSettings(tenantSlug);
    const department = settings.departments?.list?.find((d: Department) => d.id === departmentId);

    if (!department) {
      return { success: false, error: 'Department not found' };
    }

    // Verify manager exists and belongs to tenant
    const manager = await db.query.persons.findFirst({
      where: and(eq(schema.persons.id, managerId), eq(schema.persons.tenantId, tenant.id)),
      columns: {
        id: true,
      },
    });

    if (!manager) {
      return { success: false, error: 'Manager not found' };
    }

    // If setting as primary, unset other primary managers
    if (isPrimary) {
      await db
        .update(schema.departmentManagers)
        .set({
          isPrimary: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.departmentManagers.tenantId, tenant.id),
            eq(schema.departmentManagers.departmentId, departmentId),
            eq(schema.departmentManagers.isPrimary, true),
            isNull(schema.departmentManagers.endDate),
          ),
        );
    }

    // End any existing active assignment
    await db
      .update(schema.departmentManagers)
      .set({
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.departmentManagers.tenantId, tenant.id),
          eq(schema.departmentManagers.departmentId, departmentId),
          eq(schema.departmentManagers.managerId, managerId),
          isNull(schema.departmentManagers.endDate),
        ),
      );

    // Create new assignment
    const [assignment] = await db
      .insert(schema.departmentManagers)
      .values({
        tenantId: tenant.id,
        departmentId,
        managerId,
        isPrimary,
        startDate: new Date(),
      })
      .returning({ id: schema.departmentManagers.id });

    return { success: true, data: { id: assignment.id } };
  } catch (error) {
    console.error('Failed to assign manager to department:', error);
    return { success: false, error: 'Failed to assign manager to department' };
  }
}

/**
 * Remove a manager from a department
 */
export async function removeManagerFromDepartment(
  tenantSlug: string,
  departmentManagerId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // End the assignment
    await db
      .update(schema.departmentManagers)
      .set({
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.departmentManagers.id, departmentManagerId),
          eq(schema.departmentManagers.tenantId, tenant.id),
          isNull(schema.departmentManagers.endDate),
        ),
      );

    return { success: true };
  } catch (error) {
    console.error('Failed to remove manager from department:', error);
    return { success: false, error: 'Failed to remove manager from department' };
  }
}
