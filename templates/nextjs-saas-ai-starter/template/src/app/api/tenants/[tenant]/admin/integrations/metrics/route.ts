import { NextRequest, NextResponse } from 'next/server';

import { getIntegrationMetrics } from '@/features/integration-sync/services/control-plane-service';
import { auth } from '@/shared/lib/auth';
import { hasPermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';

type Provider = 'github';

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

  const provider = request.nextUrl.searchParams.get('provider') as Provider | null;
  const days = Number(request.nextUrl.searchParams.get('days') ?? 14);
  const metrics = await getIntegrationMetrics({
    tenantId: tenant.id,
    provider: provider ?? undefined,
    days: Number.isNaN(days) ? 14 : days,
  });
  return NextResponse.json({ metrics });
}
