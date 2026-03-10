'use server';

import { and, eq } from 'drizzle-orm';

import { GITHUB_PROVIDER_ID } from '@/features/github/lib/constants';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';

/**
 * Check if the current user has a personal GitHub connection.
 * Returns connection info or null.
 */
export async function getUserGitHubConnection(): Promise<{
  isConnected: boolean;
  githubUsername?: string;
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const account = await db.query.accounts.findFirst({
    where: and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.provider, GITHUB_PROVIDER_ID)),
    columns: { access_token: true, providerAccountId: true },
  });

  if (!account?.access_token) {
    return { isConnected: false };
  }

  // Try to get the GitHub username from the token
  try {
    const { GitHubClient } = await import('@/features/github/lib/client');
    const client = new GitHubClient(account.access_token);
    const user = await client.getAuthenticatedUser();
    return { isConnected: true, githubUsername: user.login };
  } catch {
    // Token might be revoked
    return { isConnected: true, githubUsername: undefined };
  }
}

/**
 * Disconnect the current user's personal GitHub connection.
 */
export async function disconnectUserGitHub(): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

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
