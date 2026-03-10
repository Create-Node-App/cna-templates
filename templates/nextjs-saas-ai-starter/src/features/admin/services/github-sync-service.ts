'use server';

import { and, eq } from 'drizzle-orm';

import { GitHubClient } from '@/features/github/lib/client';
import type { GitHubSyncResult } from '@/features/github/types';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { logger } from '@/shared/lib/logger';
import { AuditActions, logAuditEvent } from '@/shared/services/audit-service';

interface SyncGitHubOptions {
  tenantId: string;
  accessToken: string;
  organizationFilter?: string;
  syncRepositories: boolean;
  syncContributions: boolean;
  includeArchived: boolean;
  includeForks: boolean;
  contributionDaysLookback: number;
  onProgress?: (message: string) => void;
}

/**
 * Sync GitHub data for persons in the tenant that have a githubUsername.
 *
 * This function:
 * 1. Finds all persons with a github_username in the tenant
 * 2. For each person, fetches their GitHub repos and contribution data
 */
export async function syncGitHubData(options: SyncGitHubOptions): Promise<{
  results: GitHubSyncResult[];
  totalPersonsProcessed: number;
  totalReposScanned: number;
  errors: string[];
}> {
  const {
    tenantId,
    accessToken,
    organizationFilter,
    syncRepositories,
    includeArchived,
    includeForks,
    contributionDaysLookback,
    onProgress,
  } = options;

  const client = new GitHubClient(accessToken);

  // Verify connection
  const connectionTest = await client.testConnection();
  if (!connectionTest.success) {
    throw new Error(`GitHub connection failed: ${connectionTest.error}`);
  }

  onProgress?.(`Connected as ${connectionTest.user?.login}`);

  // Find all persons in this tenant with a github_username
  const personsWithGitHub = await db.query.persons.findMany({
    where: and(eq(schema.persons.tenantId, tenantId), eq(schema.persons.status, 'active')),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      githubUsername: true,
    },
  });

  const personsToSync = personsWithGitHub.filter((p) => p.githubUsername);

  if (personsToSync.length === 0) {
    onProgress?.('No persons with GitHub usernames found in this tenant.');
    return {
      results: [],
      totalPersonsProcessed: 0,
      totalReposScanned: 0,
      errors: ['No persons with GitHub usernames found. Add GitHub usernames to person profiles first.'],
    };
  }

  onProgress?.(`Found ${personsToSync.length} persons with GitHub usernames`);

  // If organization filter is set, get org members to validate
  let orgMembers: Set<string> | null = null;
  if (organizationFilter) {
    try {
      onProgress?.(`Fetching members of organization: ${organizationFilter}`);
      const members = await client.listOrgMembers(organizationFilter);
      orgMembers = new Set(members.map((m) => m.login.toLowerCase()));
      onProgress?.(`Found ${orgMembers.size} members in ${organizationFilter}`);
    } catch (err) {
      logger.warn(
        `Failed to fetch org members for ${organizationFilter}: ${err instanceof Error ? err.message : 'Unknown'}`,
      );
      onProgress?.(`Warning: Could not fetch org members. Syncing all persons anyway.`);
    }
  }

  const results: GitHubSyncResult[] = [];
  let totalReposScanned = 0;
  const errors: string[] = [];

  for (const person of personsToSync) {
    const username = person.githubUsername!;
    const personName = `${person.firstName} ${person.lastName}`;

    // If org filter, skip persons not in org
    if (orgMembers && !orgMembers.has(username.toLowerCase())) {
      onProgress?.(`Skipping ${personName} (${username}) - not in org ${organizationFilter}`);
      continue;
    }

    onProgress?.(`Processing ${personName} (${username})...`);

    try {
      const result = await syncPersonGitHub({
        client,
        tenantId,
        personId: person.id,
        username,
        syncRepositories,
        includeArchived,
        includeForks,
        contributionDaysLookback,
        onProgress,
      });

      results.push(result);
      totalReposScanned += result.reposScanned;

      if (result.errors.length > 0) {
        errors.push(...result.errors.map((e) => `${username}: ${e}`));
      }
    } catch (err) {
      const msg = `Failed to sync ${username}: ${err instanceof Error ? err.message : 'Unknown'}`;
      logger.error(msg);
      errors.push(msg);
      results.push({
        personUsername: username,
        reposScanned: 0,
        languagesFound: [],
        contributionsSynced: 0,
        errors: [msg],
      });
    }
  }

  return {
    results,
    totalPersonsProcessed: results.length,
    totalReposScanned,
    errors,
  };
}

// ============================================================================
// Per-Person Sync
// ============================================================================

interface SyncPersonOptions {
  client: GitHubClient;
  tenantId: string;
  personId: string;
  username: string;
  syncRepositories: boolean;
  includeArchived: boolean;
  includeForks: boolean;
  contributionDaysLookback: number;
  onProgress?: (message: string) => void;
}

async function syncPersonGitHub(options: SyncPersonOptions): Promise<GitHubSyncResult> {
  const {
    client,
    tenantId,
    personId,
    username,
    syncRepositories,
    includeArchived,
    includeForks,
    contributionDaysLookback,
    onProgress,
  } = options;

  const result: GitHubSyncResult = {
    personUsername: username,
    reposScanned: 0,
    languagesFound: [],
    contributionsSynced: 0,
    errors: [],
  };

  if (!syncRepositories) {
    return result;
  }

  // Fetch user's repos
  let repos = await client.listUserRepos(username, { type: 'owner', sort: 'pushed' });

  // Apply filters
  if (!includeArchived) {
    repos = repos.filter((r) => !r.archived);
  }
  if (!includeForks) {
    repos = repos.filter((r) => !r.fork);
  }

  result.reposScanned = repos.length;
  onProgress?.(`  Found ${repos.length} repositories for ${username}`);

  // Aggregate languages across all repos
  const languageTotals: Record<string, number> = {};

  for (const repo of repos.slice(0, 50)) {
    try {
      const languages = await client.getRepoLanguages(repo.full_name.split('/')[0], repo.name);
      for (const [lang, bytes] of Object.entries(languages)) {
        languageTotals[lang] = (languageTotals[lang] ?? 0) + bytes;
      }
    } catch {
      continue;
    }
  }

  // Sort languages by byte count
  const sortedLanguages = Object.entries(languageTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([lang]) => lang);

  result.languagesFound = sortedLanguages;
  onProgress?.(`  Languages found: ${sortedLanguages.slice(0, 10).join(', ')}`);

  // Get contribution summary (commits, PRs)
  if (syncRepositories) {
    try {
      const contributions = await client.getUserContributionSummary(username, {
        maxRepos: 30,
        sinceDays: contributionDaysLookback,
      });
      result.contributionsSynced = contributions.totalCommits + contributions.totalPRs;
      onProgress?.(`  Contributions: ${contributions.totalCommits} commits, ${contributions.totalPRs} PRs`);
    } catch (err) {
      result.errors.push(`Failed to fetch contributions: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  // Update integration processing job
  try {
    const existingJob = await db.query.integrationProcessingJobs.findFirst({
      where: and(
        eq(schema.integrationProcessingJobs.tenantId, tenantId),
        eq(schema.integrationProcessingJobs.personId, personId),
        eq(schema.integrationProcessingJobs.integration, 'github'),
      ),
    });

    const jobMetadata = JSON.stringify({
      reposScanned: result.reposScanned,
      languages: sortedLanguages,
    });

    if (existingJob) {
      await db
        .update(schema.integrationProcessingJobs)
        .set({
          status: 'done',
          metadata: jobMetadata,
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.integrationProcessingJobs.id, existingJob.id));
    } else {
      await db.insert(schema.integrationProcessingJobs).values({
        tenantId,
        personId,
        integration: 'github',
        status: 'done',
        metadata: jobMetadata,
        startedAt: new Date(),
        finishedAt: new Date(),
      });
    }
  } catch (err) {
    logger.warn({ err, personId }, 'Failed to create integration processing job');
  }

  // Log audit event (async, non-blocking)
  logAuditEvent({
    tenantId,
    actorId: undefined, // System action
    action: AuditActions.INTEGRATION_SYNC_COMPLETED,
    entityType: 'integration_processing_job',
    entityId: personId,
    metadata: {
      integration: 'github',
      personId,
      reposScanned: result.reposScanned,
      languagesFound: sortedLanguages.length,
    },
  }).catch((err) => logger.error({ err }, 'Failed to log GitHub sync audit event'));

  return result;
}
