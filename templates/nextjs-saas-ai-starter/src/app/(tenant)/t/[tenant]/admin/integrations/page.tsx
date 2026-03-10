/**
 * Admin Integrations overview: list available integrations grouped by status.
 * Uses brand icons and colors from the integration brand registry.
 */

import { CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { AdminPageHeader, IntegrationControlPlanePanel } from '@/features/admin';
import { getTenantSettings } from '@/features/admin/services/settings-service';
import { getIntegrationBrand } from '@/shared/components/icons/integration-brand';
import { Badge, Button } from '@/shared/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StatusDot } from '@/shared/components/ui/status-dot';
import { requirePermission } from '@/shared/lib/permissions';

interface IntegrationsPageProps {
  params: Promise<{ tenant: string }>;
}

interface IntegrationDef {
  id: string;
  nameKey: string;
  descriptionKey: string;
  href: string;
  isConnected: boolean;
  isEnabled: boolean;
  lastSyncAt: string | null;
  comingSoon: boolean;
}

export default async function IntegrationsPage({ params }: IntegrationsPageProps) {
  const { tenant } = await params;

  await requirePermission(tenant, 'admin:integrations');

  const t = await getTranslations('admin');

  // Load tenant settings to determine connection status
  const settings = await getTenantSettings(tenant);
  const ghSettings = settings?.integrations?.github;

  // Define all integrations with their status
  const integrations: IntegrationDef[] = [
    // Active integrations
    {
      id: 'webhooks',
      nameKey: 'integrationsPage.webhooks.name',
      descriptionKey: 'integrationsPage.webhooks.description',
      href: '/admin/integrations/webhooks',
      isConnected: (settings?.integrations?.webhooks?.length ?? 0) > 0,
      isEnabled: true,
      lastSyncAt: null,
      comingSoon: false,
    },
    // GitHub - active integration
    {
      id: 'github',
      nameKey: 'integrationsPage.github.name',
      descriptionKey: 'integrationsPage.github.description',
      href: '/admin/integrations/github',
      isConnected: ghSettings?.enabled ?? false,
      isEnabled: ghSettings?.enabled ?? false,
      lastSyncAt: ghSettings?.lastSyncAt ?? null,
      comingSoon: false,
    },
    // Active integrations
    {
      id: 'google-workspace',
      nameKey: 'integrationsPage.googleWorkspace.name',
      descriptionKey: 'integrationsPage.googleWorkspace.description',
      href: '/admin/integrations/google-workspace',
      isConnected: false,
      isEnabled: false,
      lastSyncAt: null,
      comingSoon: true,
    },
    {
      id: 'slack',
      nameKey: 'integrationsPage.slack.name',
      descriptionKey: 'integrationsPage.slack.description',
      href: '/admin/integrations/slack',
      isConnected: false,
      isEnabled: false,
      lastSyncAt: null,
      comingSoon: true,
    },
    {
      id: 'gitlab',
      nameKey: 'integrationsPage.gitlab.name',
      descriptionKey: 'integrationsPage.gitlab.description',
      href: '/admin/integrations/gitlab',
      isConnected: false,
      isEnabled: false,
      lastSyncAt: null,
      comingSoon: true,
    },
    {
      id: 'linkedin',
      nameKey: 'integrationsPage.linkedin.name',
      descriptionKey: 'integrationsPage.linkedin.description',
      href: '/admin/integrations/linkedin',
      isConnected: false,
      isEnabled: false,
      lastSyncAt: null,
      comingSoon: true,
    },
  ];

  // Group integrations by status
  const connectedIntegrations = integrations.filter((i) => i.isConnected && !i.comingSoon);
  const availableIntegrations = integrations.filter((i) => !i.isConnected && !i.comingSoon);
  const comingSoonIntegrations = integrations.filter((i) => i.comingSoon);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t('integrationsPage.title')}
        description={t('integrationsPage.description')}
        backHref={`/t/${tenant}/admin`}
        backLabel={t('title')}
      />

      <IntegrationControlPlanePanel tenantSlug={tenant} />

      {/* Connected Integrations */}
      {connectedIntegrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t('integrationsPage.connectedSection')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectedIntegrations.map((integration) => {
              const brand = getIntegrationBrand(integration.id);
              const BrandIcon = brand?.icon;
              return (
                <Card
                  key={integration.id}
                  className="relative overflow-hidden border-l-4 transition-shadow hover:shadow-md"
                  style={{ borderLeftColor: brand?.color ?? '#22c55e' }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {BrandIcon && <BrandIcon className="h-8 w-8 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <span className="block">{t(integration.nameKey)}</span>
                      </div>
                      <Badge variant="success" className="text-xs shrink-0 gap-1.5">
                        <StatusDot color="success" pulse size="sm" />
                        {t('integrationsPage.statusConnected')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{t(integration.descriptionKey)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {integration.lastSyncAt && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t('integrationsPage.lastSync', {
                          date: new Date(integration.lastSyncAt).toLocaleDateString(),
                        })}
                      </div>
                    )}
                    <Button asChild>
                      <Link href={`/t/${tenant}${integration.href}`}>{t('integrationsPage.configure')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      {availableIntegrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('integrationsPage.availableSection')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableIntegrations.map((integration) => {
              const brand = getIntegrationBrand(integration.id);
              const BrandIcon = brand?.icon;
              return (
                <Card
                  key={integration.id}
                  className="relative overflow-hidden transition-shadow hover:shadow-md border-t-2"
                  style={{ borderTopColor: brand?.color ?? '#e5e7eb' }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {BrandIcon && <BrandIcon className="h-8 w-8 shrink-0" />}
                      <span>{t(integration.nameKey)}</span>
                    </CardTitle>
                    <CardDescription>{t(integration.descriptionKey)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="secondary">
                      <Link href={`/t/${tenant}${integration.href}`}>{t('integrationsPage.configure')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Coming Soon Integrations */}
      {comingSoonIntegrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">{t('integrationsPage.comingSoonSection')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoonIntegrations.map((integration) => {
              const brand = getIntegrationBrand(integration.id);
              const BrandIcon = brand?.icon;
              return (
                <Card
                  key={integration.id}
                  className="relative overflow-hidden opacity-80 hover:opacity-100 transition-all hover:shadow-sm"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {BrandIcon && (
                        <BrandIcon className="h-8 w-8 shrink-0 grayscale group-hover:grayscale-0 transition-all" />
                      )}
                      <span>{t(integration.nameKey)}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {t('integrationsPage.statusComingSoon')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{t(integration.descriptionKey)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/t/${tenant}${integration.href}`}>{t('integrationsPage.learnMore')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Integrations | Admin',
  description: 'Connect external tools and view synced data',
};
