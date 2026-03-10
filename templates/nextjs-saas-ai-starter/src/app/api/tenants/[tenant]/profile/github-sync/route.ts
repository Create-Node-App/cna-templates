/**
 * User-level GitHub sync: sync the current user's own GitHub data.
 * POST /api/tenants/[tenant]/profile/github-sync
 *
 * Token resolution:
 * 1. User's own GitHub token (from user-connect) → full access, no org restriction
 * 2. Admin's GitHub token (fallback) → may be limited to org scope
 *
 * Streams NDJSON progress.
 */

import { and, eq } from 'drizzle-orm';

import { syncGitHubData } from '@/features/admin/services/github-sync-service';
import { getTenantSettings } from '@/features/admin/services/settings-service';
import { GITHUB_PROVIDER_ID } from '@/features/github/lib/constants';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

export async function POST(_request: Request, context: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await context.params;

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const tenantRecord = await getTenantBySlug(tenant);
  if (!tenantRecord) {
    return new Response(JSON.stringify({ error: 'Tenant not found' }), { status: 404 });
  }

  // Check the user has a person record with a GitHub username
  const person = await db.query.persons.findFirst({
    where: and(eq(schema.persons.tenantId, tenantRecord.id), eq(schema.persons.email, session.user.email)),
    columns: { id: true, githubUsername: true, firstName: true, lastName: true },
  });

  if (!person) {
    return new Response(JSON.stringify({ error: 'Person not found' }), { status: 404 });
  }

  if (!person.githubUsername) {
    return new Response(
      JSON.stringify({ error: 'No GitHub username set. Go to Profile Settings to connect your GitHub account.' }),
      { status: 400 },
    );
  }

  // Get GitHub settings
  const settings = await getTenantSettings(tenant);
  const ghSettings = settings.integrations?.github;

  if (!ghSettings?.enabled) {
    return new Response(
      JSON.stringify({ error: 'GitHub integration is not enabled for this tenant. Ask an admin to enable it.' }),
      { status: 400 },
    );
  }

  // Token resolution: user's own token first, then any admin token
  let accessToken: string | null = null;
  let usingOwnToken = false;

  // 1. Check for user's own GitHub token
  const userAccount = await db.query.accounts.findFirst({
    where: and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.provider, GITHUB_PROVIDER_ID)),
    columns: { access_token: true },
  });

  if (userAccount?.access_token) {
    accessToken = userAccount.access_token;
    usingOwnToken = true;
  } else {
    // 2. Fall back to any GitHub account (admin-connected)
    const adminAccount = await db.query.accounts.findFirst({
      where: eq(schema.accounts.provider, GITHUB_PROVIDER_ID),
      columns: { access_token: true },
    });
    if (adminAccount?.access_token) {
      accessToken = adminAccount.access_token;
    }
  }

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        error:
          'No GitHub connection available. Connect your GitHub account from Profile Settings, or ask an admin to connect GitHub.',
      }),
      { status: 400 },
    );
  }

  // Stream progress using NDJSON
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      };

      try {
        send({
          type: 'progress',
          message: `Syncing GitHub data for @${person.githubUsername}${usingOwnToken ? ' (using your personal token)' : ' (using organization token)'}...`,
        });

        const result = await syncGitHubData({
          tenantId: tenantRecord.id,
          accessToken,
          syncRepositories: ghSettings?.syncRepositories ?? true,
          syncContributions: ghSettings?.syncContributions ?? true,
          includeArchived: ghSettings?.includeArchived ?? false,
          includeForks: ghSettings?.includeForks ?? false,
          contributionDaysLookback: ghSettings?.contributionDaysLookback ?? 365,
          // When using user's own token: no org filter restriction
          organizationFilter: usingOwnToken ? undefined : ghSettings?.organizationFilter,
          onProgress: (message) => send({ type: 'progress', message }),
        });

        // Filter to just this user's result
        const myResult = result.results.find(
          (r) => r.personUsername.toLowerCase() === person.githubUsername!.toLowerCase(),
        );

        send({
          type: 'complete',
          result: {
            totalPersonsProcessed: myResult ? 1 : 0,
            totalReposScanned: myResult?.reposScanned ?? 0,
            results: myResult ? [myResult] : [],
            errors: myResult?.errors ?? [],
          },
        });
      } catch (err) {
        send({
          type: 'error',
          error: err instanceof Error ? err.message : 'Sync failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
