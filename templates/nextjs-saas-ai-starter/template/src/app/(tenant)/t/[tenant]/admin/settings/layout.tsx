import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { SettingsProvider } from '@/features/admin/components/settings/SettingsProvider';
import { getTenantWithSettings } from '@/features/admin/services/settings-service';

interface SettingsLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

/**
 * Settings Layout
 *
 * Provides shared settings context to all settings pages.
 * Adds common breadcrumb navigation.
 */
export default async function SettingsLayout({ children, params }: SettingsLayoutProps) {
  const { tenant } = await params;

  const tenantData = await getTenantWithSettings(tenant);

  if (!tenantData) {
    notFound();
  }

  return (
    <SettingsProvider
      tenantSlug={tenantData.slug}
      tenantName={tenantData.name}
      tenantDescription={tenantData.description}
      initialSettings={tenantData.settings}
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/t/${tenant}/admin`} className="hover:text-foreground transition-colors">
            Admin
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Settings</span>
        </nav>
        {children}
      </div>
    </SettingsProvider>
  );
}
