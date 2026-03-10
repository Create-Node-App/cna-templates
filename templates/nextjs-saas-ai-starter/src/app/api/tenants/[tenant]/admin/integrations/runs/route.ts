import { NextRequest, NextResponse } from 'next/server';

import { listIntegrationRuns } from '@/features/integration-sync/services/control-plane-service';
import { auth } from '@/shared/lib/auth';
import { hasPermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';

export async function GET(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const allowed =
    (await hasPermission(tenantSlug, 'integrations:metrics_read')) ||
    (await hasPermission(tenantSlug, 'admin:integrations'));
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const providerParam = request.nextUrl.searchParams.get('provider');
  const runs = await listIntegrationRuns({
    tenantId: tenant.id,
    provider: providerParam ? (providerParam as 'github') : undefined,
    limit: Number(request.nextUrl.searchParams.get('limit') ?? 20),
  });

  return NextResponse.json({ runs });
}
