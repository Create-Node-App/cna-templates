/**
 * Auth Provider Selection - Next.js SaaS AI Template
 *
 * Pure helpers that decide which production SSO provider is active. The
 * configured provider comes from `AUTH_PROVIDER` (server) or
 * `NEXT_PUBLIC_AUTH_PROVIDER` (client); both default to Auth0 for backward
 * compatibility. When the selected provider has no credentials configured,
 * resolution falls back to the development credentials provider.
 *
 * This module is intentionally side-effect free (no `env`/`db` imports) so
 * it can be unit tested without validation or database setup. Server code
 * passes validated `env` values in; client code reads the public variable.
 *
 * @see https://authjs.dev/getting-started/providers/workos
 */

/** Production SSO provider IDs registered with Auth.js. */
export const AUTH_PROVIDER_IDS = ['auth0', 'workos'] as const;

/** A production SSO provider ID. */
export type SsoProviderId = (typeof AUTH_PROVIDER_IDS)[number];

/** Any provider the app can route a login through, including development. */
export type AuthProviderId = SsoProviderId | 'development';

/** Raw inputs for provider resolution (validated env values on the server). */
export interface AuthProviderConfig {
  /** Value of `AUTH_PROVIDER` (or the public mirror on the client). */
  configured?: string;
  /** Whether Auth0 credentials are fully configured. */
  auth0Configured: boolean;
  /** Whether WorkOS credentials are fully configured. */
  workosConfigured: boolean;
}

/** Display names used on login buttons. */
const DISPLAY_NAMES: Record<AuthProviderId, string> = {
  auth0: 'Auth0',
  workos: 'WorkOS',
  development: 'Development',
};

/**
 * Resolve the active auth provider from configuration.
 *
 * Rules (in order):
 * 1. `workos` when configured as `AUTH_PROVIDER=workos` with WorkOS credentials.
 * 2. `auth0` when configured as `AUTH_PROVIDER=auth0` (or unset) with Auth0 credentials.
 * 3. `development` otherwise (no production SSO available).
 *
 * Unknown `AUTH_PROVIDER` values fall through to the credential checks, so a
 * typo never registers a provider ID that Auth.js does not know.
 *
 * @param config - Configured provider name plus per-provider credential flags.
 * @returns The provider ID to register and route logins through.
 */
export function resolveAuthProviderId(config: AuthProviderConfig): AuthProviderId {
  const { configured, auth0Configured, workosConfigured } = config;

  if ((configured === undefined || configured === 'auth0') && auth0Configured) {
    return 'auth0';
  }

  if (configured === 'workos' && workosConfigured) {
    return 'workos';
  }

  // Auth0 is the default: use it whenever its credentials exist, even if a
  // different (unknown) value was configured.
  if (configured !== 'workos' && auth0Configured) {
    return 'auth0';
  }

  // WorkOS stays available as a fallback when it is the only configured SSO.
  if (configured !== 'auth0' && workosConfigured) {
    return 'workos';
  }

  return 'development';
}

/**
 * Check whether a value is a known production SSO provider ID.
 *
 * @param value - The value to check (e.g. raw `AUTH_PROVIDER`).
 * @returns True for `'auth0'` and `'workos'`.
 */
export function isSsoProviderId(value: string | undefined): value is SsoProviderId {
  return value === 'auth0' || value === 'workos';
}

/**
 * Get the human-readable display name for a provider ID.
 *
 * @param providerId - The resolved provider ID.
 * @returns The display name shown on login buttons (e.g. `'WorkOS'`).
 */
export function getAuthProviderDisplayName(providerId: AuthProviderId): string {
  return DISPLAY_NAMES[providerId];
}

/**
 * Read the active provider ID on the client from the public env mirror.
 *
 * Client components cannot import the validated server `env`, so the build
 * exposes the selection as `NEXT_PUBLIC_AUTH_PROVIDER`. Falls back to
 * `'auth0'` when unset so existing deployments keep working.
 *
 * @returns The configured public provider ID, or `'auth0'` by default.
 */
export function getPublicAuthProviderId(): SsoProviderId {
  const configured = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_AUTH_PROVIDER : undefined;
  return isSsoProviderId(configured) ? configured : 'auth0';
}
