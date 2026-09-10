/**
 * WorkOS AuthKit Integration - Next.js SaaS AI Template
 *
 * Advanced opt-in alternative to the Auth.js SSO provider setup: hosted
 * AuthKit UI (login, signup, MFA), native organization multi-tenancy, and
 * session management via `@workos-inc/authkit-nextjs`.
 *
 * AuthKit activates only when all of `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`,
 * `WORKOS_COOKIE_PASSWORD`, and `WORKOS_REDIRECT_URI` are set (see
 * {@link isWorkosAuthKitConfigured}); otherwise the app runs the default
 * Auth.js flow untouched.
 *
 * This module stays free of AuthKit SDK imports (the SDK ships ESM that is
 * not transformable under pnpm test paths, and server routes import it
 * directly). Only validated env access plus pure organization-mapping
 * helpers live here.
 *
 * @see https://workos.com/docs/authkit/nextjs
 */

import { env } from '@/shared/lib/env';

/** Minimal WorkOS organization reference used for tenant mapping. */
export interface WorkosOrganizationRef {
  /** WorkOS organization ID (`org_...`). */
  id: string;
  /** Human-readable organization name. */
  name: string;
}

/**
 * Check whether the AuthKit integration is fully configured.
 *
 * All four variables are required by the SDK; a partial configuration is
 * treated as unconfigured so the default Auth.js flow keeps working.
 *
 * @returns True when AuthKit can be initialized.
 */
export function isWorkosAuthKitConfigured(): boolean {
  return Boolean(
    env.WORKOS_API_KEY && env.WORKOS_CLIENT_ID && env.WORKOS_COOKIE_PASSWORD && env.WORKOS_REDIRECT_URI,
  );
}

/**
 * Derive a tenant slug from a WorkOS organization name.
 *
 * Mirrors the template's slug rules: lowercase, non-alphanumerics become
 * dashes, collapsed and trimmed. Falls back to the organization ID suffix
 * when the name yields an empty slug.
 *
 * @param organization - The WorkOS organization reference.
 * @returns The tenant slug to map the organization to.
 */
export function workosOrganizationToTenantSlug(organization: WorkosOrganizationRef): string {
  const slug = organization.name
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug) {
    return slug;
  }

  return `org-${organization.id.replace(/^org_/, '').slice(0, 8)}`;
}

/**
 * Select the active WorkOS organization for a session.
 *
 * Prefers an explicitly requested organization ID (e.g. from tenant
 * switching); otherwise uses the user's first organization; null when the
 * user belongs to no organization.
 *
 * @param organizations - Organizations on the AuthKit session user.
 * @param preferredId - Organization ID requested by the caller, if any.
 * @returns The selected organization, or null when there is none.
 */
export function selectWorkosOrganization(
  organizations: WorkosOrganizationRef[] | undefined,
  preferredId?: string,
): WorkosOrganizationRef | null {
  if (!organizations || organizations.length === 0) {
    return null;
  }

  if (preferredId) {
    const match = organizations.find((org) => org.id === preferredId);
    if (match) {
      return match;
    }
  }

  return organizations[0];
}
