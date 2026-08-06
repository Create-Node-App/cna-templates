'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';

import { SidebarBottomActions } from './SidebarBottomActions';
import { SidebarUserMenu } from './SidebarUserMenu';

interface SidebarMobileHeaderProps {
  /** Base path for logo link (e.g., /t/tenant) */
  basePath: string;
  tenantSlug?: string;
  /** Logo content to render */
  logo: ReactNode;
  /** Current user */
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  /** Callback to open mobile menu */
  onMenuOpen: () => void;
  /** Show "Back to main app" link in user dropdown */
  showBackLink?: boolean;
  /** Label for back link */
  backLinkLabel?: string;
}

export function SidebarMobileHeader({
  basePath,
  tenantSlug,
  logo,
  user,
  onMenuOpen,
  showBackLink = false,
  backLinkLabel,
}: SidebarMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card lg:hidden">
      <div className="flex items-center gap-2 px-4">
        <Link href={basePath || '/'} className="flex items-center gap-2">
          {logo}
        </Link>
      </div>

      <div className="flex items-center gap-2 px-4">
        <SidebarBottomActions tenantSlug={tenantSlug} />
        {user && (
          <SidebarUserMenu
            user={user}
            tenantSlug={tenantSlug}
            showBackLink={showBackLink}
            backLinkLabel={backLinkLabel}
            showProfileLink
            isCompact
          />
        )}
        {tenantSlug && (
          <Button variant="ghost" size="icon" onClick={onMenuOpen}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
