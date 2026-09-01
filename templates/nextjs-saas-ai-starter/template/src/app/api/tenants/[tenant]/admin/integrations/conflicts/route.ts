import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import {
  listIntegrationConflicts,
  resolveIntegrationConflict,
} from '@/features/integration-sync/services/control-plane-service';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
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

  const provider = request.nextUrl.searchParams.get('provider');
  const conflicts = await listIntegrationConflicts({
    tenantId: tenant.id,
    provider: provider ? (provider as 'github') : undefined,
    onlyOpen: request.nextUrl.searchParams.get('onlyOpen') !== 'false',
    limit: Number(request.nextUrl.searchParams.get('limit') ?? 100),
  });
  return NextResponse.json({ conflicts });
}

export async function POST(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const allowed =
    (await hasPermission(tenantSlug, 'integrations:conflicts_resolve')) ||
    (await hasPermission(tenantSlug, 'admin:integrations'));
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = (await request.json()) as { conflictId?: string; action?: string; status?: 'resolved' | 'ignored' };
  if (!body.conflictId || !body.action) {
    return NextResponse.json({ error: 'conflictId and action are required' }, { status: 400 });
  }

  const membership = await db.query.tenantMemberships.findFirst({
    where: and(eq(schema.tenantMemberships.tenantId, tenant.id), eq(schema.tenantMemberships.userId, session.user.id)),
    columns: { personId: true },
  });
  if (!membership?.personId) {
    return NextResponse.json({ error: 'No person mapped for current user' }, { status: 400 });
  }

  const conflict = await resolveIntegrationConflict({
    tenantId: tenant.id,
    conflictId: body.conflictId,
    actorPersonId: membership.personId,
    action: body.action,
    status: body.status,
  });

  if (!conflict) return NextResponse.json({ error: 'Conflict not found' }, { status: 404 });
  return NextResponse.json({ conflict });
}
