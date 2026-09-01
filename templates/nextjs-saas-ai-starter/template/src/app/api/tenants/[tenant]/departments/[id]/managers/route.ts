import { NextRequest, NextResponse } from 'next/server';

import { requireTenantAdmin } from '@/shared/lib/rbac';
import { assignManagerToDepartment, removeManagerFromDepartment } from '@/shared/services/department-service';

interface RouteContext {
  params: Promise<{
    tenant: string;
    id: string;
  }>;
}

/**
 * POST /api/tenants/[tenant]/departments/[id]/managers
 * Assign a manager to a department (admin only)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug, id: departmentId } = await context.params;
    await requireTenantAdmin(tenantSlug);

    const body = await req.json();
    const { managerId, isPrimary } = body as { managerId: string; isPrimary?: boolean };

    if (!managerId) {
      return NextResponse.json({ error: 'managerId is required' }, { status: 400 });
    }

    const result = await assignManagerToDepartment(tenantSlug, departmentId, managerId, isPrimary ?? false);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ id: result.data?.id }, { status: 201 });
  } catch (error) {
    console.error('Error assigning manager to department:', error);
    return NextResponse.json({ error: 'Failed to assign manager to department' }, { status: 500 });
  }
}

/**
 * DELETE /api/tenants/[tenant]/departments/[id]/managers
 * Remove a manager from a department (admin only)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug, id: _departmentId } = await context.params;
    await requireTenantAdmin(tenantSlug);

    const body = await req.json();
    const { departmentManagerId } = body as { departmentManagerId: string };
    void _departmentId; // Unused but required by route structure

    if (!departmentManagerId) {
      return NextResponse.json({ error: 'departmentManagerId is required' }, { status: 400 });
    }

    const result = await removeManagerFromDepartment(tenantSlug, departmentManagerId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing manager from department:', error);
    return NextResponse.json({ error: 'Failed to remove manager from department' }, { status: 500 });
  }
}
