import { NextRequest, NextResponse } from 'next/server';

import { requireTenantAdmin, requireTenantMember } from '@/shared/lib/rbac';
import {
  deleteDepartment,
  getDepartmentManager,
  getDepartmentMembers,
  updateDepartment,
} from '@/shared/services/department-service';

interface RouteContext {
  params: Promise<{
    tenant: string;
    id: string;
  }>;
}

/**
 * GET /api/tenants/[tenant]/departments/[id]
 * Get department details (members and managers)
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug, id: departmentId } = await context.params;
    await requireTenantMember(tenantSlug);

    const [membersResult, managersResult] = await Promise.all([
      getDepartmentMembers(tenantSlug, departmentId),
      getDepartmentManager(tenantSlug, departmentId),
    ]);

    if (!membersResult.success) {
      return NextResponse.json({ error: membersResult.error }, { status: 400 });
    }

    return NextResponse.json({
      members: membersResult.data ?? [],
      managers: managersResult.data ?? [],
    });
  } catch (error) {
    console.error('Error fetching department details:', error);
    return NextResponse.json({ error: 'Failed to fetch department details' }, { status: 500 });
  }
}

/**
 * PUT /api/tenants/[tenant]/departments/[id]
 * Update a department (admin only)
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug, id: departmentId } = await context.params;
    await requireTenantAdmin(tenantSlug);

    const body = await req.json();
    const { name, parentId, description, sortOrder } = body as {
      name?: string;
      parentId?: string;
      description?: string;
      sortOrder?: number;
    };

    const result = await updateDepartment(tenantSlug, departmentId, {
      name,
      parentId,
      description,
      sortOrder,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

/**
 * DELETE /api/tenants/[tenant]/departments/[id]
 * Delete a department (admin only)
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug, id: departmentId } = await context.params;
    await requireTenantAdmin(tenantSlug);

    const result = await deleteDepartment(tenantSlug, departmentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
