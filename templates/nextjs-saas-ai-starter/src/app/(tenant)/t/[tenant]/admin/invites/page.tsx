/**
 * Admin Invitations Page
 *
 * Manage tenant invitations with personalized onboarding URLs.
 */

import { redirect } from 'next/navigation';

import { InvitesClient } from '@/features/admin/components/InvitesClient';
import { auth } from '@/shared/lib/auth';
import { requireTenantAdmin } from '@/shared/lib/rbac';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface InvitesPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function InvitesPage({ params }: InvitesPageProps) {
  const { tenant: tenantSlug } = await params;

  // Auth check
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Verify tenant exists
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    redirect('/');
  }

  // Check admin access
  const adminSession = await requireTenantAdmin(tenantSlug);
  if (!adminSession) {
    redirect(`/t/${tenantSlug}`);
  }

  return <InvitesClient tenantSlug={tenantSlug} />;
}
