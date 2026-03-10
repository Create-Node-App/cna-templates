import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { ThemeCSSInjector } from '@/shared/components/providers/theme-css-injector';
import { getCurrentUserPermissions } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';
import { parseTenantSettings } from '@/shared/lib/tenant-settings';
import { TenantProvider } from '@/shared/providers';

import { TenantLayoutClient } from './TenantLayoutClient';

// Ensure permissions and auth are always resolved (no static cache)
export const dynamic = 'force-dynamic';

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

/**
 * Tenant-scoped layout
 *
 * This layout wraps all pages under /t/{tenant}/ and provides:
 * - Tenant validation (404 if tenant doesn't exist)
 * - TenantProvider context for client components (includes settings)
 * - Tenant-specific styling/branding (future)
 *
 * Note: Sidebar visibility is handled by TenantLayoutClient using usePathname()
 * to ensure correct behavior during client-side navigation.
 */
export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant: tenantSlug } = await params;

  // Validate tenant exists
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  // Parse tenant settings
  const settings = parseTenantSettings(tenant.settings);

  // Permissions for sidebar/nav (may be returned from session when set by auth callback)
  const permissions = await getCurrentUserPermissions(tenant.slug);

  return (
    <TenantProvider
      value={{
        slug: tenant.slug,
        id: tenant.id,
        name: tenant.name,
        settings,
      }}
    >
      <ThemeCSSInjector />
      <TenantLayoutClient tenantSlug={tenant.slug} permissions={permissions}>
        {children}
      </TenantLayoutClient>
    </TenantProvider>
  );
}
