/**
 * Team Members Admin Page
 *
 * Server component that fetches initial data and renders the client.
 */

import { redirect } from 'next/navigation';
import { MembersClient } from '@/features/admin/components/MembersClient';
import { listMembers } from '@/features/admin/services/members-service';
import { auth } from '@/shared/lib/auth';

interface MembersPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { tenant } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/t/${tenant}/login`);
  }

  const result = await listMembers(tenant, { page: 1 });

  if (!result.success || !result.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-800">Error Loading Team Members</h2>
        <p className="mt-2 text-sm text-red-600">{result.error || 'An unexpected error occurred'}</p>
      </div>
    );
  }

  return <MembersClient tenantSlug={tenant} initialData={result.data} currentUserId={session.user.id} />;
}

export const metadata = {
  title: 'Team Members | Admin',
  description: "Manage your organization's team members and their roles",
};
