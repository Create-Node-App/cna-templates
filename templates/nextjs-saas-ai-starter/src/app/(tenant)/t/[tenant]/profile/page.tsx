import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { GitHubSyncButton } from '@/features/profile/components/GitHubSyncButton';
import { ProfileSettingsForm } from '@/features/profile/components/ProfileSettingsForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { db } from '@/shared/db';
import { persons } from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface ProfilePageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { tenant: tenantSlug } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/t/${tenantSlug}/login`);
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) redirect('/');

  const person = await db.query.persons.findFirst({
    where: and(eq(persons.tenantId, tenant.id), eq(persons.email, session.user.email)),
  });

  if (!person) redirect(`/t/${tenantSlug}/dashboard`);

  const displayName = `${person.firstName} ${person.lastName}`.trim();
  const initials =
    displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const isGitHubEnabled = !!person.githubUsername;

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user.image ?? undefined} alt={displayName} />
              <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{displayName}</CardTitle>
              <p className="text-muted-foreground">{person.email}</p>
              {person.title && <p className="text-sm text-muted-foreground">{person.title}</p>}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm
            tenantSlug={tenantSlug}
            person={{
              id: person.id,
              name: displayName,
              title: person.title,
              bio: person.bio,
              githubUsername: person.githubUsername,
            }}
          />
        </CardContent>
      </Card>

      {isGitHubEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <GitHubSyncButton
              tenantSlug={tenantSlug}
              githubUsername={person.githubUsername!}
              isGitHubEnabled={isGitHubEnabled}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
