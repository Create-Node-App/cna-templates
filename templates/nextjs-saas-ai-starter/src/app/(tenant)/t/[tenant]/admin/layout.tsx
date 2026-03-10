import { redirect } from 'next/navigation';

import { hasPermission } from '@/shared/lib/permissions';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

/**
 * Admin layout - permission check only
 *
 * The UnifiedSidebar in TenantLayoutClient handles all navigation rendering
 * based on the current view (derived from URL path).
 */
export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { tenant } = await params;

  const canAccessAdmin = await hasPermission(tenant, 'admin:dashboard');
  if (!canAccessAdmin) {
    redirect(`/t/${tenant}?error=unauthorized`);
  }

  // No sidebar here - UnifiedSidebar in parent layout handles it
  // Just pass through children
  return <>{children}</>;
}
