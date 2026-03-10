'use client';

/**
 * Client-side layout wrapper for tenant routes
 *
 * Provides:
 * - GlobalSearchProvider for command palette
 * - SidebarProvider for collapse state
 * - ViewProvider for view switching (My, Admin)
 * - UnifiedSidebar across all views (My, Admin)
 * - Top header with profile access
 */

import type { ReactNode } from 'react';

import { TopHeader, UnifiedSidebar } from '@/shared/components/layout';
import { CommandPalette, GlobalSearchProvider } from '@/shared/components/search';
import { SidebarProvider, useSidebar, ViewProvider } from '@/shared/providers';

interface TenantLayoutClientProps {
  children: ReactNode;
  tenantSlug: string;
  /** Current user permissions in this tenant (from getCurrentUserPermissions). Used for sidebar visibility. */
  permissions?: string[];
}

/**
 * Inner component that uses sidebar context for dynamic padding
 */
function TenantLayoutContent({
  children,
  tenantSlug,
  permissions,
}: {
  children: ReactNode;
  tenantSlug: string;
  permissions: string[];
}) {
  const { isCollapsed } = useSidebar();

  return (
    <ViewProvider permissions={permissions} tenantSlug={tenantSlug}>
      <div className="min-h-screen bg-background">
        <CommandPalette />
        <TopHeader tenantSlug={tenantSlug} />
        <UnifiedSidebar tenantSlug={tenantSlug} permissions={permissions} />
        <main className={isCollapsed ? 'lg:pl-16 pt-0 lg:pt-16' : 'lg:pl-64 pt-0 lg:pt-16'}>
          <div className="container mx-auto py-6 px-4">{children}</div>
        </main>
      </div>
    </ViewProvider>
  );
}

export function TenantLayoutClient({ children, tenantSlug, permissions = [] }: TenantLayoutClientProps) {
  // Unified layout with sidebar for all routes
  // View-specific rendering is handled by UnifiedSidebar based on current view from ViewProvider
  return (
    <GlobalSearchProvider>
      <SidebarProvider>
        <TenantLayoutContent tenantSlug={tenantSlug} permissions={permissions}>
          {children}
        </TenantLayoutContent>
      </SidebarProvider>
    </GlobalSearchProvider>
  );
}
