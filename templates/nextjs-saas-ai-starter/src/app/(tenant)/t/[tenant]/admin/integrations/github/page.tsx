/**
 * Admin GitHub integration page: credentials config, connection, settings, and sync wizard.
 */

import { Plug } from 'lucide-react';
import { redirect } from 'next/navigation';

import { AdminPageHeader } from '@/features/admin';
import { GitHubCredentialsForm } from '@/features/admin/components/GitHubCredentialsForm';
import { GitHubSettingsPanel } from '@/features/admin/components/GitHubSettingsPanel';
import { GitHubSyncWizard } from '@/features/admin/components/GitHubSyncWizard';
import { getGitHubTenantCredentials } from '@/features/admin/services/github-credentials-service';
import { getGitHubConnectionInfo } from '@/features/admin/services/github-settings-service';
import { getTenantSettings } from '@/features/admin/services/settings-service';
import { getGitHubCredentials } from '@/features/github/lib/oauth';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { auth } from '@/shared/lib/auth';
import { env } from '@/shared/lib/env';
import { requirePermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface GitHubPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function GitHubPage({ params }: GitHubPageProps) {
  const { tenant } = await params;

  await requirePermission(tenant, 'admin:integrations');

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/t/${tenant}/login`);
  }

  const tenantRecord = await getTenantBySlug(tenant);
  if (!tenantRecord) {
    redirect(`/t/${tenant}/admin`);
  }

  // Check for credentials: tenant settings first, then env vars
  const tenantCredentials = await getGitHubTenantCredentials(tenant);
  const credentials = getGitHubCredentials(tenantCredentials ?? undefined);
  const hasEnvCredentials = !!(env.GITHUB_INTEGRATION_CLIENT_ID && env.GITHUB_INTEGRATION_CLIENT_SECRET);

  // If no credentials configured anywhere, show configuration form
  if (!credentials) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="GitHub"
          description="Track contributions and activity from GitHub repositories."
          backHref={`/t/${tenant}/admin/integrations`}
          backLabel="Integrations"
        />
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-500/25 dark:bg-amber-500/[0.07]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              Integration Not Configured
            </CardTitle>
            <CardDescription>
              Configure your GitHub OAuth App credentials to enable this integration. Create an OAuth App at{' '}
              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                github.com/settings/developers
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
        <GitHubCredentialsForm
          tenantSlug={tenant}
          hasEnvCredentials={hasEnvCredentials}
          initialClientId={tenantCredentials?.clientId ?? ''}
          initialClientSecret={tenantCredentials?.clientSecret ?? ''}
        />
      </div>
    );
  }

  // Credentials are configured - show the full integration page
  const [tenantSettings, connectionInfo] = await Promise.all([
    getTenantSettings(tenant),
    getGitHubConnectionInfo(session.user.id),
  ]);

  const ghSettings = tenantSettings.integrations?.github;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="GitHub"
        description="Track contributions and activity from GitHub repositories."
        backHref={`/t/${tenant}/admin/integrations`}
        backLabel="Integrations"
      />

      {/* Settings Panel (includes connection status + connect button) */}
      <GitHubSettingsPanel
        tenantSlug={tenant}
        settings={ghSettings}
        isConnected={connectionInfo.isConnected}
        connectedGithubUsername={connectionInfo.githubUsername}
        hasEnvCredentials={hasEnvCredentials}
      />

      {/* Sync Wizard - shown when enabled and connected */}
      {ghSettings?.enabled && connectionInfo.isConnected && (
        <GitHubSyncWizard tenantSlug={tenant} settings={ghSettings} />
      )}

      {/* Credentials form: only when NOT using env vars (overridable per-tenant) */}
      {!hasEnvCredentials && (
        <GitHubCredentialsForm
          tenantSlug={tenant}
          hasEnvCredentials={false}
          initialClientId={tenantCredentials?.clientId ?? ''}
          initialClientSecret={tenantCredentials?.clientSecret ?? ''}
        />
      )}
    </div>
  );
}

export const metadata = {
  title: 'GitHub | Integrations | Admin',
  description: 'Connect GitHub and sync contributions and activity',
};
