'use client';

/**
 * Settings panel for Webhooks integration - enable/disable the feature.
 */

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from '@/shared/components/ui';

import { saveIntegrationFeatureFlags } from '../services/integration-feature-flags-service';

interface WebhooksSettingsPanelProps {
  tenantSlug: string;
  initialEnabled: boolean;
}

export function WebhooksSettingsPanel({ tenantSlug, initialEnabled }: WebhooksSettingsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setError(null);

    startTransition(async () => {
      const result = await saveIntegrationFeatureFlags(tenantSlug, { webhooks: checked });

      if (!result.success) {
        // Revert on error
        setEnabled(!checked);
        setError(result.error ?? 'Failed to save settings');
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhooks Settings</CardTitle>
        <CardDescription>Configure webhook integration for this tenant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="space-y-0.5">
            <span className="text-sm font-medium leading-none">Enable Webhooks</span>
            <p className="text-xs text-muted-foreground">
              When enabled, events will be sent to configured webhook endpoints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!enabled && (
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            Webhooks are currently disabled. Enable them to start sending event notifications to external services.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
