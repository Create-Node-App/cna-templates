/**
 * User-level GitHub OAuth: redirect the current user to GitHub to authorize.
 * GET /api/integrations/github/user-connect?returnUrl=/t/foo/profile/settings
 *
 * Similar to the admin connect route but marks the state as type=user so the
 * callback knows to store the token against this user and auto-set their
 * githubUsername on their person record.
 */

import { NextResponse } from 'next/server';

import { getGitHubTenantCredentials } from '@/features/admin/services/github-credentials-service';
import { buildGitHubAuthorizationUrl, getGitHubCredentials, getGitHubRedirectUri } from '@/features/github/lib/oauth';
import { auth } from '@/shared/lib/auth';

/**
 * Extract tenant slug from returnUrl path (e.g., /t/demo/profile/... -> demo)
 */
function extractTenantFromReturnUrl(returnUrl: string): string | null {
  const match = returnUrl.match(/^\/t\/([^/]+)/);
  return match ? match[1] : null;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get('returnUrl') ?? '/select-tenant';
  const safeReturn = returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/select-tenant';

  const tenantSlug = extractTenantFromReturnUrl(safeReturn);

  let tenantCredentials: { clientId?: string; clientSecret?: string } | null = null;
  if (tenantSlug) {
    tenantCredentials = await getGitHubTenantCredentials(tenantSlug);
  }

  const credentials = getGitHubCredentials(tenantCredentials ?? undefined);

  if (!credentials) {
    return NextResponse.json({ error: 'GitHub integration is not configured' }, { status: 503 });
  }

  const redirectUri = getGitHubRedirectUri(request);

  // Include type=user in state so callback knows this is a user-level connection
  const state = Buffer.from(JSON.stringify({ returnUrl: safeReturn, tenantSlug, type: 'user' }), 'utf-8').toString(
    'base64url',
  );

  const authorizeUrl = buildGitHubAuthorizationUrl(redirectUri, state, credentials);

  return NextResponse.redirect(authorizeUrl);
}
