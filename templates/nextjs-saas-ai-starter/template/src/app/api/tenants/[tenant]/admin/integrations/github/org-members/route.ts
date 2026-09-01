/**
 * Preview GitHub organization members and their mapping to Next.js SaaS AI Template persons.
 * GET /api/tenants/[tenant]/admin/integrations/github/org-members?org=my-org
 */

import { and, eq } from 'drizzle-orm';

import { GitHubClient } from '@/features/github/lib/client';
import { GITHUB_PROVIDER_ID } from '@/features/github/lib/constants';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { requirePermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';

export async function GET(request: Request, context: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await context.params;

  await requirePermission(tenant, 'admin:integrations');

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const org = searchParams.get('org');

  if (!org) {
    return Response.json({ error: 'Missing org parameter' }, { status: 400 });
  }

  const tenantRecord = await getTenantBySlug(tenant);
  if (!tenantRecord) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Get the admin's GitHub token
  const account = await db.query.accounts.findFirst({
    where: and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.provider, GITHUB_PROVIDER_ID)),
    columns: { access_token: true },
  });

  if (!account?.access_token) {
    return Response.json({ error: 'GitHub not connected' }, { status: 400 });
  }

  try {
    const client = new GitHubClient(account.access_token);

    // Fetch org members
    const orgMembers = await client.listOrgMembers(org);

    // Get all persons in this tenant
    const tenantPersons = await db.query.persons.findMany({
      where: eq(schema.persons.tenantId, tenantRecord.id),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        githubUsername: true,
      },
    });

    // Build a mapping: for each org member, try to find a matching person
    const membersWithMapping = orgMembers.map((member) => {
      // Match by githubUsername first
      const matchedByGH = tenantPersons.find((p) => p.githubUsername?.toLowerCase() === member.login.toLowerCase());

      return {
        githubLogin: member.login,
        githubId: member.id,
        avatarUrl: member.avatar_url,
        matchedPersonId: matchedByGH?.id ?? null,
        matchedPersonName: matchedByGH ? `${matchedByGH.firstName} ${matchedByGH.lastName}` : null,
        matchedPersonEmail: matchedByGH?.email ?? null,
        matchStatus: matchedByGH ? ('matched' as const) : ('unmatched' as const),
      };
    });

    // Also include all persons for the mapping dropdown
    const availablePersons = tenantPersons.map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      githubUsername: p.githubUsername,
    }));

    return Response.json({
      org,
      totalMembers: membersWithMapping.length,
      matchedCount: membersWithMapping.filter((m) => m.matchStatus === 'matched').length,
      members: membersWithMapping,
      availablePersons,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch org members' },
      { status: 500 },
    );
  }
}
