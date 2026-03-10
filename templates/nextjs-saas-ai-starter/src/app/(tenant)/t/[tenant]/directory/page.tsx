import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { DirectoryClient } from '@/features/directory/components/DirectoryClient';
import { requireTenantMember } from '@/shared/lib/rbac';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface DirectoryPageProps {
  params: Promise<{ tenant: string }>;
}

/**
 * Directory Page
 *
 * Browse all team members with advanced search and filtering capabilities.
 */
export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { tenant: tenantSlug } = await params;
  await requireTenantMember(tenantSlug);

  const tenant = await getTenantBySlug(tenantSlug);
  const t = await getTranslations('directory');

  if (!tenant) {
    redirect(`/t/${tenantSlug}`);
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('description')}</p>
      </div>

      <DirectoryClient tenantSlug={tenantSlug} />
    </div>
  );
}
