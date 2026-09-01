/**
 * GitHub OAuth2: authorization flow helpers.
 *
 * GitHub OAuth uses a simple code-exchange flow (no refresh tokens by default).
 * Access tokens do not expire unless revoked by the user.
 *
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
 */

import { env } from '@/shared/lib/env';

import { GITHUB_OAUTH_AUTHORIZE_URL, GITHUB_OAUTH_TOKEN_URL, GITHUB_REQUIRED_SCOPES } from './constants';
import type { GitHubTokenResponse } from '../types';

const GITHUB_CALLBACK_PATH = '/api/integrations/github/callback';

// ============================================================================
// Credential Resolution
// ============================================================================

export interface GitHubCredentials {
  clientId: string;
  clientSecret: string;
}

/**
 * Get GitHub OAuth credentials.
 * Priority: tenant settings > env vars
 */
export function getGitHubCredentials(tenantCredentials?: {
  clientId?: string;
  clientSecret?: string;
}): GitHubCredentials | null {
  // Try tenant settings first
  if (tenantCredentials?.clientId && tenantCredentials?.clientSecret) {
    return {
      clientId: tenantCredentials.clientId,
      clientSecret: tenantCredentials.clientSecret,
    };
  }
  // Fall back to env vars
  if (env.GITHUB_INTEGRATION_CLIENT_ID && env.GITHUB_INTEGRATION_CLIENT_SECRET) {
    return {
      clientId: env.GITHUB_INTEGRATION_CLIENT_ID,
      clientSecret: env.GITHUB_INTEGRATION_CLIENT_SECRET,
    };
  }
  return null;
}

/**
 * Check if GitHub OAuth is configured.
 */
export function isGitHubConfigured(tenantCredentials?: { clientId?: string; clientSecret?: string }): boolean {
  return getGitHubCredentials(tenantCredentials) !== null;
}

// ============================================================================
// Callback URL Helpers
// ============================================================================

/**
 * Build the app origin used for OAuth redirect_uri.
 */
export function getGitHubCallbackBaseUrl(request: Request): string {
  if (env.AUTH_URL) {
    return env.AUTH_URL.replace(/\/$/, '');
  }
  const headers = request.headers;
  const proto = headers.get('x-forwarded-proto');
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  if (proto && host) {
    return `${proto === 'https' ? 'https' : 'http'}://${host}`;
  }
  try {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
}

/** Full redirect_uri for GitHub OAuth. */
export function getGitHubRedirectUri(request: Request): string {
  return `${getGitHubCallbackBaseUrl(request)}${GITHUB_CALLBACK_PATH}`;
}

/**
 * Build the GitHub authorization URL for OAuth flow.
 */
export function buildGitHubAuthorizationUrl(
  redirectUri: string,
  state: string,
  credentials: GitHubCredentials,
): string {
  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: redirectUri,
    scope: GITHUB_REQUIRED_SCOPES.join(' '),
    state,
    allow_signup: 'false',
  });

  return `${GITHUB_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

// ============================================================================
// Token Exchange
// ============================================================================

/**
 * Exchange authorization code for an access token.
 * GitHub OAuth tokens do not expire (no refresh token needed).
 */
export async function exchangeGitHubCodeForToken(
  code: string,
  redirectUri: string,
  credentials?: GitHubCredentials,
): Promise<GitHubTokenResponse> {
  const creds = credentials ?? getGitHubCredentials();
  if (!creds) {
    throw new Error('GitHub OAuth is not configured');
  }

  const body = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(GITHUB_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub token exchange failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as GitHubTokenResponse & { error?: string; error_description?: string };

  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error} - ${data.error_description}`);
  }

  return data;
}
