/**
 * Bulk assign GitHub usernames to Next.js SaaS AI Template persons.
 * POST /api/tenants/[tenant]/admin/integrations/github/assign-usernames
 *
 * Body: { mappings: [{ personId: string, githubUsername: string }] }
 */

import { and, eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { requirePermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface Mapping {
  personId: string;
  githubUsername: string;
}

export async function POST(request: Request, context: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await context.params;

  await requirePermission(tenant, 'admin:integrations');

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantRecord = await getTenantBySlug(tenant);
  if (!tenantRecord) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const body = (await request.json()) as { mappings?: Mapping[] };
  const mappings = body.mappings ?? [];

  if (mappings.length === 0) {
    return Response.json({ error: 'No mappings provided' }, { status: 400 });
  }

  let updated = 0;
  const errors: string[] = [];

  for (const mapping of mappings) {
    try {
      const sanitizedUsername = mapping.githubUsername
        .trim()
        .replace(/^@/, '')
        .replace(/^https?:\/\/github\.com\//, '');

      await db
        .update(schema.persons)
        .set({
          githubUsername: sanitizedUsername,
          updatedAt: new Date(),
        })
        .where(and(eq(schema.persons.id, mapping.personId), eq(schema.persons.tenantId, tenantRecord.id)));

      updated++;
    } catch (err) {
      errors.push(`Failed to map ${mapping.githubUsername}: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  return Response.json({ updated, errors });
}
