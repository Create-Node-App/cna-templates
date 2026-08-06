/**
 * Start GitHub OAuth2 flow: redirect user to GitHub to authorize.
 * GET /api/integrations/github/connect?returnUrl=/t/foo/admin/integrations/github
 */

import { NextResponse } from 'next/server';

import { getGitHubTenantCredentials } from '@/features/admin/services/github-credentials-service';
import { buildGitHubAuthorizationUrl, getGitHubCredentials, getGitHubRedirectUri } from '@/features/github/lib/oauth';
import { auth } from '@/shared/lib/auth';

/**
 * Extract tenant slug from returnUrl path (e.g., /t/demo/admin/... -> demo)
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
  // Only allow relative paths
  const safeReturn = returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/select-tenant';

  // Extract tenant from returnUrl to get tenant-specific credentials
  const tenantSlug = extractTenantFromReturnUrl(safeReturn);

  // Get credentials: tenant settings first, then env vars
  let tenantCredentials: { clientId?: string; clientSecret?: string } | null = null;
  if (tenantSlug) {
    tenantCredentials = await getGitHubTenantCredentials(tenantSlug);
  }

  const credentials = getGitHubCredentials(tenantCredentials ?? undefined);

  if (!credentials) {
    return NextResponse.json({ error: 'GitHub integration is not configured' }, { status: 503 });
  }

  const redirectUri = getGitHubRedirectUri(request);

  // Include tenantSlug in state so callback can use the same credentials
  const state = Buffer.from(JSON.stringify({ returnUrl: safeReturn, tenantSlug }), 'utf-8').toString('base64url');

  const authorizeUrl = buildGitHubAuthorizationUrl(redirectUri, state, credentials);

  return NextResponse.redirect(authorizeUrl);
}
