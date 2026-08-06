/**
 * Admin Webhooks integration page: manage outgoing webhook endpoints.
 */

import { Webhook } from 'lucide-react';

import { AdminPageHeader } from '@/features/admin';
import { WebhooksClient } from '@/features/admin/components/WebhooksClient';
import { WebhooksSettingsPanel } from '@/features/admin/components/WebhooksSettingsPanel';
import { getTenantSettings } from '@/features/admin/services/settings-service';
import { getAvailableEventTypes, listWebhookEndpoints } from '@/features/admin/services/webhook-admin-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { requirePermission } from '@/shared/lib/permissions';

interface WebhooksPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function WebhooksPage({ params }: WebhooksPageProps) {
  const { tenant } = await params;

  await requirePermission(tenant, 'admin:integrations');

  const [settings, endpointsResult, eventTypes] = await Promise.all([
    getTenantSettings(tenant),
    listWebhookEndpoints(tenant),
    getAvailableEventTypes(),
  ]);

  const webhooksEnabled = settings.features?.webhooks ?? false;
  const endpoints = endpointsResult.success ? endpointsResult.data : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Webhooks"
        description="Send event notifications to external services."
        backHref={`/t/${tenant}/admin/integrations`}
        backLabel="Integrations"
      />

      {/* Settings panel with enable/disable toggle */}
      <WebhooksSettingsPanel tenantSlug={tenant} initialEnabled={webhooksEnabled} />

      {/* Info card when enabled but no webhooks configured */}
      {webhooksEnabled && endpoints.length === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              Get Started with Webhooks
            </CardTitle>
            <CardDescription>
              Webhooks allow you to send real-time notifications to external services when events happen in Agentic A8n
              Hub. For example, send a message to Slack when a new member joins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click &quot;Add Webhook&quot; below to create your first webhook endpoint.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Webhooks management client */}
      <WebhooksClient
        tenantSlug={tenant}
        initialEndpoints={endpoints}
        eventTypes={eventTypes}
        isEnabled={webhooksEnabled}
      />
    </div>
  );
}

export const metadata = {
  title: 'Webhooks | Integrations | Admin',
  description: 'Manage outgoing webhook endpoints',
};
