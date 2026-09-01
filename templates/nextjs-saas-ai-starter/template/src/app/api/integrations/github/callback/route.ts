/**
 * GitHub OAuth2 callback: exchange code for token and store account.
 * GET /api/integrations/github/callback?code=...&state=...
 *
 * Handles both admin-level and user-level connections:
 * - type=admin (default): stores token for admin integration use
 * - type=user: stores token for the current user + auto-sets their githubUsername
 *
 * GitHub OAuth tokens do NOT expire (no refresh token). They remain valid
 * until revoked by the user. We store them in the accounts table.
 */

import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getGitHubTenantCredentials } from '@/features/admin/services/github-credentials-service';
import { GitHubClient } from '@/features/github/lib/client';
import { GITHUB_PROVIDER_ID } from '@/features/github/lib/constants';
import { exchangeGitHubCodeForToken, getGitHubCredentials, getGitHubRedirectUri } from '@/features/github/lib/oauth';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  let returnUrl = '/select-tenant';
  let tenantSlug: string | null = null;
  let connectType: 'admin' | 'user' = 'admin';

  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf-8')) as {
        returnUrl?: string;
        tenantSlug?: string;
        type?: 'admin' | 'user';
      };
      if (decoded.returnUrl && decoded.returnUrl.startsWith('/') && !decoded.returnUrl.startsWith('//')) {
        returnUrl = decoded.returnUrl;
      }
      if (decoded.tenantSlug) {
        tenantSlug = decoded.tenantSlug;
      }
      if (decoded.type === 'user') {
        connectType = 'user';
      }
    } catch {
      // ignore invalid state
    }
  }

  // Get credentials: tenant settings first, then env vars
  let tenantCredentials: { clientId?: string; clientSecret?: string } | null = null;
  if (tenantSlug) {
    tenantCredentials = await getGitHubTenantCredentials(tenantSlug);
  }

  const credentials = getGitHubCredentials(tenantCredentials ?? undefined);

  if (!credentials) {
    return NextResponse.redirect(new URL('/select-tenant?error=github_not_configured', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${returnUrl}?error=github_missing_code`, request.url));
  }

  const redirectUri = getGitHubRedirectUri(request);

  try {
    const tokens = await exchangeGitHubCodeForToken(code, redirectUri, credentials);

    // Get the authenticated user to use as providerAccountId
    const client = new GitHubClient(tokens.access_token);
    const ghUser = await client.getAuthenticatedUser();
    const providerAccountId = String(ghUser.id);

    // One connection per user per provider: remove any existing GitHub account for this user
    await db
      .delete(schema.accounts)
      .where(and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.provider, GITHUB_PROVIDER_ID)));

    // Store the token
    await db
      .insert(schema.accounts)
      .values({
        userId: session.user.id,
        type: 'oauth',
        provider: GITHUB_PROVIDER_ID,
        providerAccountId,
        access_token: tokens.access_token,
        token_type: tokens.token_type ?? 'bearer',
        scope: tokens.scope,
      })
      .onConflictDoUpdate({
        target: [schema.accounts.provider, schema.accounts.providerAccountId],
        set: {
          access_token: tokens.access_token,
          token_type: tokens.token_type ?? 'bearer',
          scope: tokens.scope,
          userId: session.user.id,
        },
      });

    // For user-level connections: auto-set the githubUsername on the person record
    if (connectType === 'user' && tenantSlug && ghUser.login) {
      const tenant = await getTenantBySlug(tenantSlug);
      if (tenant && session.user.email) {
        await db
          .update(schema.persons)
          .set({
            githubUsername: ghUser.login,
            updatedAt: new Date(),
          })
          .where(and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.email, session.user.email)));
      }
    }

    return NextResponse.redirect(new URL(returnUrl, request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.redirect(
      new URL(`${returnUrl}?error=github_connect_failed&message=${encodeURIComponent(message)}`, request.url),
    );
  }
}
