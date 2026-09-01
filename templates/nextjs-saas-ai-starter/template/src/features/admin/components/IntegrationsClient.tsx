'use client';

import { IntegrationControlPlanePanel } from './IntegrationControlPlanePanel';

interface IntegrationsClientProps {
  tenantSlug: string;
}

export function IntegrationsClient({ tenantSlug }: IntegrationsClientProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Integrations</h2>
        <p className="text-muted-foreground text-sm">Manage your connected services and sync settings.</p>
      </div>

      <IntegrationControlPlanePanel tenantSlug={tenantSlug} />
    </div>
  );
}
