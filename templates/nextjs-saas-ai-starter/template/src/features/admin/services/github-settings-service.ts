'use server';

import { and, eq } from 'drizzle-orm';

import { GitHubClient } from '@/features/github/lib/client';
import { GITHUB_PROVIDER_ID } from '@/features/github/lib/constants';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { requirePermission } from '@/shared/lib/permissions';
import type { TenantSettings } from '@/shared/lib/tenant-settings';

import { getTenantSettings, updateTenantSettings } from './settings-service';

export interface GitHubSettingsUpdate {
  enabled?: boolean;
  organizationFilter?: string;
  syncRepositories?: boolean;
  inferSkills?: boolean;
  syncContributions?: boolean;
  includeArchived?: boolean;
  includeForks?: boolean;
  contributionDaysLookback?: number;
}

/**
 * Update GitHub integration settings.
 */
export async function updateGitHubSettings(
  tenantSlug: string,
  updates: GitHubSettingsUpdate,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  await requirePermission(tenantSlug, 'admin:integrations');

  try {
    const currentSettings = await getTenantSettings(tenantSlug);
    const currentGH = currentSettings.integrations?.github;

    const updatedGH = {
      ...currentGH,
      ...updates,
      // Track when integration was enabled/disabled
      ...(updates.enabled !== undefined && updates.enabled !== currentGH?.enabled
        ? {
            enabledAt: new Date().toISOString(),
            enabledBy: session.user.id,
          }
        : {}),
    };

    await updateTenantSettings(tenantSlug, {
      integrations: {
        ...currentSettings.integrations,
        github: updatedGH,
      },
    } as Partial<TenantSettings>);

    return { success: true };
  } catch (error) {
    console.error('Failed to update GitHub settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

/**
 * Disconnect GitHub account for the current user.
 */
export async function disconnectGitHub(tenantSlug: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  await requirePermission(tenantSlug, 'admin:integrations');

  try {
    await db
      .delete(schema.accounts)
      .where(and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.provider, GITHUB_PROVIDER_ID)));

    return { success: true };
  } catch (error) {
    console.error('Failed to disconnect GitHub:', error);
    return { success: false, error: 'Failed to disconnect' };
  }
}

/**
 * Get GitHub connection info for the current user.
 * Includes the connected GitHub username if available.
 */
export async function getGitHubConnectionInfo(
  userId: string,
): Promise<{ isConnected: boolean; githubUsername?: string; email?: string }> {
  try {
    const account = await db.query.accounts.findFirst({
      where: and(eq(schema.accounts.userId, userId), eq(schema.accounts.provider, GITHUB_PROVIDER_ID)),
      columns: { provider: true, access_token: true, providerAccountId: true },
    });

    if (!account?.access_token) {
      return { isConnected: false };
    }

    // Try to get GitHub username from the API
    try {
      const client = new GitHubClient(account.access_token);
      const ghUser = await client.getAuthenticatedUser();
      return {
        isConnected: true,
        githubUsername: ghUser.login,
        email: ghUser.email ?? undefined,
      };
    } catch {
      // Token may be revoked, still return connected based on DB record
      return { isConnected: true };
    }
  } catch {
    return { isConnected: false };
  }
}
