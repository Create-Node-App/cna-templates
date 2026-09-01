import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { cache } from 'react';

import { db } from '@/shared/db';
import { tenants } from '@/shared/db/schema';

/** Get the underlying cause message from a Drizzle or database error */
function getCauseMessage(err: unknown): string {
  const e = err as Error & { cause?: unknown };
  if (e?.cause instanceof Error) return e.cause.message;
  if (e?.message) return e.message;
  return String(err);
}

/**
 * Get the current tenant slug from the URL path.
 *
 * For path-based multi-tenancy: /t/{slug}/...
 *
 * This is cached per request to avoid multiple lookups.
 */
export const getCurrentTenantSlug = cache(async (): Promise<string | null> => {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';

  // Match /t/{slug} pattern
  const match = pathname.match(/^\/t\/([^/]+)/);
  return match ? match[1] : null;
});

/**
 * Get the current tenant from the database.
 *
 * Cached per request for efficiency.
 *
 * @returns Tenant object or null if not found
 */
export const getCurrentTenant = cache(async () => {
  const slug = await getCurrentTenantSlug();
  if (!slug) return null;

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });
    return tenant;
  } catch (err) {
    const cause = getCauseMessage(err);
    throw new Error(`Tenant lookup failed for slug "${slug}": ${cause}`, { cause: err });
  }
});

/**
 * Get tenant by slug from the database.
 *
 * @param slug - Tenant slug
 * @returns Tenant object or null if not found
 */
export async function getTenantBySlug(slug: string) {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });
    return tenant;
  } catch (err) {
    const cause = getCauseMessage(err);
    throw new Error(`Tenant lookup failed for slug "${slug}": ${cause}`, { cause: err });
  }
}

/**
 * Validate that a tenant slug exists.
 *
 * Used in middleware for early validation.
 */
export async function validateTenantSlug(slug: string): Promise<boolean> {
  const tenant = await getTenantBySlug(slug);
  return tenant !== null;
}

/**
 * Build a tenant-scoped URL path.
 *
 * @example
 * buildTenantPath('acme', '/dashboard') // '/t/acme/dashboard'
 * buildTenantPath('acme', 'skills')     // '/t/acme/skills'
 */
export function buildTenantPath(tenantSlug: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/t/${tenantSlug}${cleanPath}`;
}

/**
 * Extract tenant slug from a path.
 *
 * @example
 * extractTenantSlug('/t/acme/dashboard') // 'acme'
 * extractTenantSlug('/about')            // null
 */
export function extractTenantSlug(path: string): string | null {
  const match = path.match(/^\/t\/([^/]+)/);
  return match ? match[1] : null;
}
