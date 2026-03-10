'use client';

import { BookOpen, LogOut, Search, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';

import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher';
import { useGlobalSearchOptional } from '@/shared/components/search/GlobalSearchProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { cn } from '@/shared/lib/utils';
import { useSidebarOptional } from '@/shared/providers';

interface TopHeaderProps {
  tenantSlug?: string;
}

/**
 * Top header component with profile access in the top-right corner.
 * Positioned as a fixed header that adjusts based on sidebar collapse state.
 * Height matches the sidebar header (h-16) for visual alignment.
 */
export function TopHeader({ tenantSlug }: TopHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations();

  const sidebarContext = useSidebarOptional();
  const isCollapsed = sidebarContext?.isCollapsed ?? false;
  const globalSearch = useGlobalSearchOptional();

  // Detect macOS for showing ⌘ vs Ctrl (SSR-safe via useSyncExternalStore)
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /mac/i.test(navigator.userAgent),
    () => false,
  );

  const basePath = tenantSlug ? `/t/${tenantSlug}` : '';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 hidden lg:flex h-16 items-center justify-between gap-3 border-b border-border/80 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 transition-[left] duration-200 ease-out',
        isCollapsed ? 'lg:left-16' : 'lg:left-64',
      )}
    >
      {/* Gradient accent stripe — continuous with sidebar stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 brand-gradient" aria-hidden />

      {/* Left side — Search trigger */}
      <div className="flex-1">
        {tenantSlug && globalSearch && (
          <button
            onClick={() => globalSearch.openCommandPalette()}
            className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-border/80 bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${tCommon('common.search')} (${isMac ? '⌘' : 'Ctrl+'}K)`}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{tCommon('common.search')}...</span>
            <kbd className="pointer-events-none ml-auto inline-flex h-5 shrink-0 items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              {isMac ? '⌘' : 'Ctrl+'}K
            </kbd>
          </button>
        )}
      </div>

      {/* Right side - Utilities + User menu */}
      <div className="flex items-center gap-1.5">
        {/* Docs link */}
        <Link
          href="/docs"
          target="_blank"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={tCommon('docs.title')}
          aria-label={tCommon('docs.title')}
        >
          <BookOpen className="h-4 w-4" />
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Locale switcher */}
        <LocaleSwitcher />

        {/* User profile dropdown */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative ml-1 h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  {user.name && <p className="font-medium">{user.name}</p>}
                  {user.email && <p className="w-40 truncate text-sm text-muted-foreground">{user.email}</p>}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/profile/settings`} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {tAuth('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button size="sm">{tAuth('signIn')}</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
