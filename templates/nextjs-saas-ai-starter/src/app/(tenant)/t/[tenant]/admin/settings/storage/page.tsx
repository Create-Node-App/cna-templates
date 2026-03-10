'use client';

import { StorageSettings, useSettings } from '@/features/admin/components/settings';

import { SaveStatusBanner } from '../SaveStatusBanner';

export default function StorageSettingsPage() {
  const { saveStatus } = useSettings();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Storage</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure S3-compatible storage for file uploads</p>
      </div>

      <SaveStatusBanner status={saveStatus} />
      <StorageSettings />
    </>
  );
}
