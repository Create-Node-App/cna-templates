'use server';

import { count, eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { requireTenantAdmin } from '@/shared/lib/rbac';

export interface AdminStats {
  persons: number;
  roles: number;
  integrationJobs: number;
}

export async function getAdminStats(tenantSlug: string): Promise<AdminStats> {
  await requireTenantAdmin(tenantSlug);

  const tenant = await db.query.tenants.findFirst({
    where: eq(schema.tenants.slug, tenantSlug),
  });

  if (!tenant) throw new Error('Tenant not found');

  const [personsResult, rolesResult, jobsResult] = await Promise.all([
    db.select({ count: count() }).from(schema.persons).where(eq(schema.persons.tenantId, tenant.id)),
    db.select({ count: count() }).from(schema.roles).where(eq(schema.roles.tenantId, tenant.id)),
    db
      .select({ count: count() })
      .from(schema.integrationProcessingJobs)
      .where(eq(schema.integrationProcessingJobs.tenantId, tenant.id)),
  ]);

  return {
    persons: personsResult[0]?.count ?? 0,
    roles: rolesResult[0]?.count ?? 0,
    integrationJobs: jobsResult[0]?.count ?? 0,
  };
}
