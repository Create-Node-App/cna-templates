import { NextRequest, NextResponse } from 'next/server';

import { requireTenantAdmin, requireTenantMember } from '@/shared/lib/rbac';
import { createDepartment, getDepartments, getDepartmentsWithDetails } from '@/shared/services/department-service';

interface RouteContext {
  params: Promise<{
    tenant: string;
  }>;
}

/**
 * GET /api/tenants/[tenant]/departments
 * Get all departments for a tenant
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug } = await context.params;
    await requireTenantMember(tenantSlug);

    const withDetails = req.nextUrl.searchParams.get('withDetails') === 'true';

    const result = withDetails ? await getDepartmentsWithDetails(tenantSlug) : await getDepartments(tenantSlug);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ departments: result.data });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

/**
 * POST /api/tenants/[tenant]/departments
 * Create a new department (admin only)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug } = await context.params;
    await requireTenantAdmin(tenantSlug);

    const body = await req.json();
    const { name, parentId, description, sortOrder } = body as {
      name: string;
      parentId?: string;
      description?: string;
      sortOrder?: number;
    };

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await createDepartment(tenantSlug, {
      name,
      parentId,
      description,
      sortOrder: sortOrder ?? 0,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ id: result.data?.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
