'use client';

import { AIProviderSettings, useSettings } from '@/features/admin/components/settings';

import { SaveStatusBanner } from '../SaveStatusBanner';

export default function AIProviderSettingsPage() {
  const { saveStatus } = useSettings();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Provider</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure AI providers and models</p>
      </div>

      <SaveStatusBanner status={saveStatus} />
      <AIProviderSettings />
    </>
  );
}
