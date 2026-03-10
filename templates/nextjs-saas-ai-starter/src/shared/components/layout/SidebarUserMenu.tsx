'use client';

import { ArrowLeft, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface SidebarUserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  tenantSlug?: string;
  /** Show "Back to main app" link (for admin/manager views) */
  showBackLink?: boolean;
  /** Label for back link */
  backLinkLabel?: string;
  /** Show profile link in mobile dropdown */
  showProfileLink?: boolean;
  /** Callback when an item is clicked (for closing mobile drawer) */
  onItemClick?: () => void;
  /** Whether to show compact version (for collapsed sidebar) */
  isCompact?: boolean;
}

export function SidebarUserMenu({
  user,
  tenantSlug,
  showBackLink = false,
  backLinkLabel,
  showProfileLink = false,
  onItemClick,
  isCompact = false,
}: SidebarUserMenuProps) {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tSettings = useTranslations('settings');

  const basePath = tenantSlug ? `/t/${tenantSlug}` : '';
  const resolvedBackLabel = backLinkLabel ?? tSettings('backToUserView');

  if (!user) {
    return (
      <Link href="/login" onClick={onItemClick}>
        <Button size="sm" className="w-full">
          {tAuth('signIn')}
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={isCompact ? 'relative h-9 w-9 rounded-full' : 'w-full justify-start gap-3 px-3 py-2 h-auto'}
        >
          <Avatar className={isCompact ? 'h-9 w-9 border-2 border-primary/20' : 'h-8 w-8 border-2 border-primary/20'}>
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {user.name?.charAt(0).toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCompact && (
            <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
              {user.name && <p className="truncate text-sm font-medium">{user.name}</p>}
              {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && <p className="w-50 truncate text-sm text-muted-foreground">{user.email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        {showProfileLink && tenantSlug && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/profile`} className="cursor-pointer" onClick={onItemClick}>
                <User className="mr-2 h-4 w-4" />
                {t('profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {showBackLink && tenantSlug && (
          <>
            <DropdownMenuItem asChild>
              <Link href={basePath} className="cursor-pointer" onClick={onItemClick}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {resolvedBackLabel}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          onClick={() => {
            onItemClick?.();
            signOut({ callbackUrl: '/' });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {tAuth('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
