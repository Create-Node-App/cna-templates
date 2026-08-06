'use client';

import { BrandingSettings, useSettings } from '@/features/admin/components/settings';

import { SaveStatusBanner } from '../SaveStatusBanner';

export default function BrandingSettingsPage() {
  const { saveStatus } = useSettings();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Branding</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize the look and feel of your organization</p>
      </div>

      <SaveStatusBanner status={saveStatus} />
      <BrandingSettings />
    </>
  );
}
