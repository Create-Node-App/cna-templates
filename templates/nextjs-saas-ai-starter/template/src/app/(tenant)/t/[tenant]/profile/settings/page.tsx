import { Settings } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ProfileSettingsForm } from '@/features/profile/components/ProfileSettingsForm';
import { getMyPerson } from '@/features/profile/services/profile-update-service';
import { PageHeader } from '@/shared/components/ui/page-header';
import { auth } from '@/shared/lib/auth';

interface ProfileSettingsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ProfileSettingsPage({ params }: ProfileSettingsPageProps) {
  const { tenant } = await params;
  const t = await getTranslations('profile.settings');

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/t/${tenant}/login`);
  }

  const person = await getMyPerson(tenant);

  if (!person) {
    redirect(`/t/${tenant}/profile`);
  }

  const displayName = person.displayName ?? `${person.firstName} ${person.lastName}`.trim();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={{
          backTo: `/t/${tenant}/profile`,
          backLabel: t('backToProfile'),
          current: t('currentPage'),
        }}
        variant="compact"
        icon={<Settings className="h-5 w-5" />}
        title={t('pageTitle')}
        description={t('pageDescription')}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <ProfileSettingsForm
          tenantSlug={tenant}
          person={{
            id: person.id,
            name: displayName,
            title: person.title,
            bio: person.bio,
            githubUsername: person.githubUsername,
          }}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Profile Settings',
  description: 'Edit your profile information and connected accounts',
};
