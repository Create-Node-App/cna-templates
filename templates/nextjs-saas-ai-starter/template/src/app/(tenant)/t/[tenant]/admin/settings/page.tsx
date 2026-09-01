'use client';

import { GeneralSettings, useSettings } from '@/features/admin/components/settings';

import { SaveStatusBanner } from './SaveStatusBanner';

/**
 * Main Settings Page
 *
 * Shows general settings (organization details, danger zone).
 * Other settings are now available as individual routes and sidebar entries.
 */
export default function SettingsPage() {
  const { saveStatus } = useSettings();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-foreground">General Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Organization details and tenant configuration</p>
      </div>

      <SaveStatusBanner status={saveStatus} />
      <GeneralSettings />
    </>
  );
}
