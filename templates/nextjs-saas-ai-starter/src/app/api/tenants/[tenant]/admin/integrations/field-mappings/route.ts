import { NextRequest, NextResponse } from 'next/server';

import {
  listIntegrationFieldMappings,
  upsertIntegrationFieldMapping,
} from '@/features/integration-sync/services/control-plane-service';
import { auth } from '@/shared/lib/auth';
import { hasPermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';

type Provider = 'github';
type Ownership = 'remote_authoritative' | 'local_authoritative' | 'merge' | 'append_only';

export async function GET(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const allowed =
    (await hasPermission(tenantSlug, 'integrations:field_mappings')) ||
    (await hasPermission(tenantSlug, 'admin:integrations'));
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const provider = request.nextUrl.searchParams.get('provider') as Provider | null;
  const mappings = await listIntegrationFieldMappings({
    tenantId: tenant.id,
    provider: provider ?? undefined,
  });
  return NextResponse.json({ mappings });
}

export async function POST(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const allowed =
    (await hasPermission(tenantSlug, 'integrations:field_mappings')) ||
    (await hasPermission(tenantSlug, 'admin:integrations'));
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = (await request.json()) as {
    provider?: Provider;
    entityType?: string;
    fieldPath?: string;
    ownership?: Ownership;
    mergeStrategy?: string;
    isEnabled?: boolean;
  };
  if (!body.provider || !body.entityType || !body.fieldPath || !body.ownership) {
    return NextResponse.json({ error: 'provider, entityType, fieldPath and ownership are required' }, { status: 400 });
  }

  const mapping = await upsertIntegrationFieldMapping({
    tenantId: tenant.id,
    provider: body.provider,
    entityType: body.entityType,
    fieldPath: body.fieldPath,
    ownership: body.ownership,
    mergeStrategy: body.mergeStrategy ?? null,
    isEnabled: body.isEnabled ?? true,
  });
  return NextResponse.json({ mapping });
}
