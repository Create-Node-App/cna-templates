/**
 * GitHub sync API route.
 * POST /api/tenants/[tenant]/admin/integrations/github/sync
 *
 * Streams real-time progress using NDJSON.
 */

import { and, eq } from 'drizzle-orm';

import { syncGitHubData } from '@/features/admin/services/github-sync-service';
import { getTenantSettings } from '@/features/admin/services/settings-service';
import { GITHUB_PROVIDER_ID } from '@/features/github/lib/constants';
import {
  finishIntegrationRun,
  startIntegrationRun,
  upsertIntegrationCursor,
} from '@/features/integration-sync/services/control-plane-service';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { hasPermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';

export async function POST(_request: Request, context: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await context.params;

  const allowed =
    (await hasPermission(tenant, 'integrations:run')) || (await hasPermission(tenant, 'admin:integrations'));
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const tenantRecord = await getTenantBySlug(tenant);
  if (!tenantRecord) {
    return new Response(JSON.stringify({ error: 'Tenant not found' }), { status: 404 });
  }

  // Get GitHub access token
  const account = await db.query.accounts.findFirst({
    where: and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.provider, GITHUB_PROVIDER_ID)),
    columns: { access_token: true },
  });

  if (!account?.access_token) {
    return new Response(JSON.stringify({ error: 'GitHub not connected' }), { status: 400 });
  }

  // Get settings
  const settings = await getTenantSettings(tenant);
  const ghSettings = settings.integrations?.github;

  // Stream progress using NDJSON
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      };

      try {
        send({ type: 'progress', message: 'Starting GitHub sync...' });
        const membership = await db.query.tenantMemberships.findFirst({
          where: and(
            eq(schema.tenantMemberships.tenantId, tenantRecord.id),
            eq(schema.tenantMemberships.userId, session.user.id),
          ),
          columns: { personId: true },
        });
        const run = await startIntegrationRun({
          tenantId: tenantRecord.id,
          provider: 'github',
          mode: 'sync_incremental',
          entities: ['repositories', 'contributions'],
          triggeredByPersonId: membership?.personId ?? undefined,
        });

        const result = await syncGitHubData({
          tenantId: tenantRecord.id,
          accessToken: account.access_token!,
          organizationFilter: ghSettings?.organizationFilter,
          syncRepositories: ghSettings?.syncRepositories ?? true,
          syncContributions: ghSettings?.syncContributions ?? true,
          includeArchived: ghSettings?.includeArchived ?? false,
          includeForks: ghSettings?.includeForks ?? false,
          contributionDaysLookback: ghSettings?.contributionDaysLookback ?? 365,
          onProgress: (message) => send({ type: 'progress', message }),
        });
        await finishIntegrationRun({
          runId: run.id,
          tenantId: tenantRecord.id,
          status: result.errors.length === 0 ? 'completed' : 'failed',
          actorId: membership?.personId ?? undefined,
          summary: {
            totalPersonsProcessed: result.totalPersonsProcessed,
            totalReposScanned: result.totalReposScanned,
            errors: result.errors,
          },
        });
        await upsertIntegrationCursor({
          tenantId: tenantRecord.id,
          provider: 'github',
          entityType: 'contributions',
          cursorValue: new Date().toISOString(),
        });

        send({
          type: 'complete',
          runId: run.id,
          result: {
            totalPersonsProcessed: result.totalPersonsProcessed,
            totalReposScanned: result.totalReposScanned,
            results: result.results,
            errors: result.errors,
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
