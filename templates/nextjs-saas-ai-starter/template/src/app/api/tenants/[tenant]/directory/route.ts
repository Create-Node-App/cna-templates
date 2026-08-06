import { and, eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { requireTenantMember } from '@/shared/lib/rbac';

interface RouteContext {
  params: Promise<{
    tenant: string;
  }>;
}

/**
 * GET /api/tenants/[tenant]/directory
 * Get all persons in the tenant for directory view
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { tenant: tenantSlug } = await context.params;
    await requireTenantMember(tenantSlug);

    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get all persons (active and onboarding, so invited/synced users appear too)
    const persons = await db.query.persons.findMany({
      where: and(eq(schema.persons.tenantId, tenant.id), inArray(schema.persons.status, ['active', 'onboarding'])),
      columns: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        title: true,
        department: true,
        departmentId: true,
        location: true,
      },
      orderBy: (fields, { asc }) => [asc(fields.lastName), asc(fields.firstName)],
    });

    return NextResponse.json({ persons });
  } catch (error) {
    console.error('Error fetching directory:', error);
    return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 });
  }
}
