import { NextRequest, NextResponse } from 'next/server';

import { requireTenantAdmin } from '@/shared/lib/rbac';
import { assignPersonToDepartment } from '@/shared/services/department-service';

interface RouteContext {
  params: Promise<{
    tenant: string;
    id: string;
  }>;
}

/**
 * POST /api/tenants/[tenant]/departments/[id]/members
 * Assign a person to a department (admin only)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug, id: departmentId } = await context.params;
    await requireTenantAdmin(tenantSlug);

    const body = await req.json();
    const { personId } = body as { personId: string };

    if (!personId) {
      return NextResponse.json({ error: 'personId is required' }, { status: 400 });
    }

    const result = await assignPersonToDepartment(tenantSlug, personId, departmentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning person to department:', error);
    return NextResponse.json({ error: 'Failed to assign person to department' }, { status: 500 });
  }
}

/**
 * DELETE /api/tenants/[tenant]/departments/[id]/members
 * Remove a person from a department (admin only)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug, id: _departmentId } = await context.params;
    await requireTenantAdmin(tenantSlug);

    const body = await req.json();
    const { personId } = body as { personId: string };
    void _departmentId; // Unused but required by route structure

    if (!personId) {
      return NextResponse.json({ error: 'personId is required' }, { status: 400 });
    }

    const result = await assignPersonToDepartment(tenantSlug, personId, null);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing person from department:', error);
    return NextResponse.json({ error: 'Failed to remove person from department' }, { status: 500 });
  }
}
