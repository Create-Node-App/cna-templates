import { NextResponse } from 'next/server';

import { getCurrentUserPermissions } from '@/shared/lib/permissions';

interface RouteParams {
  params: Promise<{ tenant: string }>;
}

/**
 * GET /api/tenants/[tenant]/permissions
 * Returns the current user's permission keys in this tenant.
 * Used by the sidebar when server-passed permissions are missing (e.g. cache).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { tenant } = await params;
    const permissions = await getCurrentUserPermissions(tenant);
    return NextResponse.json({ permissions });
  } catch {
    return NextResponse.json({ permissions: [] }, { status: 200 });
  }
}
