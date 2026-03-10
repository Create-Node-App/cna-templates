'use client';

/**
 * Feature flags for integration-related settings.
 * Displayed on the Integrations page instead of Feature Flags.
 */

import { useState, useTransition } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from '@/shared/components/ui';
import type { TenantSettings } from '@/shared/lib/tenant-settings';

import { saveIntegrationFeatureFlags } from '../services/integration-feature-flags-service';

type IntegrationFeatureKey = 'webhooks' | 'hrisIntegration';

const INTEGRATION_FEATURE_FLAGS: Array<{
  key: IntegrationFeatureKey;
  label: string;
  description: string;
}> = [
  {
    key: 'webhooks',
    label: 'Webhooks',
    description: 'Enable webhook notifications for external systems',
  },
  {
    key: 'hrisIntegration',
    label: 'HRIS Integration',
    description: 'Enable HR system integration',
  },
];

interface IntegrationFeatureFlagsProps {
  tenantSlug: string;
  initialFeatures: Partial<NonNullable<TenantSettings['features']>>;
}

export function IntegrationFeatureFlags({ tenantSlug, initialFeatures }: IntegrationFeatureFlagsProps) {
  const [isPending, startTransition] = useTransition();
  const [features, setFeatures] = useState<Partial<NonNullable<TenantSettings['features']>>>(initialFeatures);

  const handleToggle = (key: IntegrationFeatureKey, enabled: boolean) => {
    // Optimistic update
    setFeatures((prev) => ({ ...prev, [key]: enabled }));

    startTransition(async () => {
      const result = await saveIntegrationFeatureFlags(tenantSlug, { [key]: enabled });
      if (!result.success) {
        // Revert on error
        setFeatures((prev) => ({ ...prev, [key]: !enabled }));
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Features</CardTitle>
        <CardDescription>Enable or disable integration-related functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {INTEGRATION_FEATURE_FLAGS.map((feature) => (
          <label
            key={feature.key}
            htmlFor={`feature-${feature.key}`}
            className="flex items-start justify-between gap-4 cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-medium leading-none">{feature.label}</span>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
            <Switch
              id={`feature-${feature.key}`}
              checked={features[feature.key] ?? false}
              onCheckedChange={(checked) => handleToggle(feature.key, checked)}
              disabled={isPending}
            />
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
