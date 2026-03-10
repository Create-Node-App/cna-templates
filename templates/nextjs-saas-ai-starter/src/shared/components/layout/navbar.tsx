'use client';

import { BookOpen, LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { useFeatureFlags } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';
import { AppLogo } from '../brand/Logo';

interface NavbarProps {
  tenantSlug?: string;
}

export function Navbar({ tenantSlug }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations();

  // Get feature flags
  const featureFlags = useFeatureFlags(['knowledgeBase']);

  const basePath = tenantSlug ? `/t/${tenantSlug}` : '';

  // Check if user has manager role for current tenant
  const isManager = useMemo(() => {
    if (!user?.roles || !tenantSlug) return false;
    const roles = user.roles as Record<string, string>;
    const tenantRole = roles[tenantSlug];
    return tenantRole === 'manager' || tenantRole === 'admin';
  }, [user?.roles, tenantSlug]);

  // Build nav items based on feature flags
  const navItems = useMemo(() => {
    const items = [
      { href: `${basePath}`, label: t('dashboard'), exact: true },
      { href: `${basePath}/people`, label: t('directory') },
      { href: `${basePath}/team`, label: t('team') },
    ];

    // Add manager link for managers
    if (isManager) {
      items.push({ href: `${basePath}/manager`, label: t('manager') });
    }

    // Conditionally add knowledge base
    if (featureFlags.knowledgeBase) {
      items.push({ href: `${basePath}/knowledge`, label: t('knowledgeBase') });
    }

    // Always show assistant
    items.push({ href: `${basePath}/assistant`, label: t('assistant') });

    return items;
  }, [basePath, t, featureFlags.knowledgeBase, isManager]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-card/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <AppLogo href={basePath || '/'} size="md" />

        {/* Navigation */}
        {tenantSlug && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
                  isActive(item.href, item.exact)
                    ? 'text-primary bg-primary/15 font-semibold shadow-sm after:absolute after:bottom-0 after:left-2 after:right-2 after:block after:h-0.5 after:rounded-full after:bg-primary after:content-[""]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Locale Switcher */}
          <LocaleSwitcher />
          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
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
                <DropdownMenuItem asChild>
                  <Link href={`${basePath}/profile`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/docs" target="_blank" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {tCommon('docs.title')}
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

          {/* Mobile menu button */}
          {tenantSlug && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {tenantSlug && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient">
                  <span className="text-lg font-bold text-white">S</span>
                </div>
                <span className="text-lg font-bold">Next.js SaaS AI Template</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
                  className={cn(
                    'flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive(item.href, item.exact)
                      ? 'bg-primary/15 text-primary font-semibold [box-shadow:inset_3px_0_0_0_hsl(var(--primary))]'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {user && (
              <div className="absolute bottom-6 left-4 right-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}
