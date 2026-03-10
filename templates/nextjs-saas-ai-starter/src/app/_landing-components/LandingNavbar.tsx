'use client';

import { Globe, Menu, Moon, Sun, X } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { useLayoutEffect, useState } from 'react';

import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { AppLogo } from '@/shared/components/brand/Logo';
import { Button } from '@/shared/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface LandingNavbarProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  tenantSlugs?: string[];
}

export function LandingNavbar({ user, tenantSlugs = [] }: LandingNavbarProps) {
  const locale = useLocale();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    // Required to prevent hydration mismatch with theme provider
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const getDashboardUrl = () => {
    if (tenantSlugs.length === 1) {
      return `/t/${tenantSlugs[0]}`;
    }
    if (tenantSlugs.length > 1) {
      return '/select-tenant';
    }
    return '/select-tenant';
  };

  const switchLanguage = (newLocale: string) => {
    // Update locale cookie and reload page
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <AppLogo href="/" size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-4" aria-label="Main navigation">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
          >
            Docs
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-xs sm:text-sm" aria-label="Select language">
                <Globe className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{locale.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">{locale === 'es' ? 'Idioma' : 'Language'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => switchLanguage('en')} className={locale === 'en' ? 'bg-primary/10' : ''}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLanguage('es')} className={locale === 'es' ? 'bg-primary/10' : ''}>
                Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Toggle theme" className="gap-2">
                  {resolvedTheme === 'dark' ? (
                    <Moon className="h-4 w-4" aria-hidden />
                  ) : (
                    <Sun className="h-4 w-4" aria-hidden />
                  )}
                  <span className="hidden sm:inline text-xs">{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">{locale === 'es' ? 'Tema' : 'Theme'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme('light')}
                  className={theme === 'light' ? 'bg-primary/10' : ''}
                >
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-primary/10' : ''}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('system')}
                  className={theme === 'system' ? 'bg-primary/10' : ''}
                >
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Auth Section */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href={getDashboardUrl()}>
                <Button size="sm" variant="outline">
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden lg:inline">{user.name ?? user.email}</span>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
              <Link href="/book-demo">
                <Button size="sm" variant="outline">
                  {locale === 'es' ? 'Agendar Demo' : 'Book a Demo'}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="#features"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>

            <div className="border-t border-border/40 pt-3 space-y-2">
              {user ? (
                <>
                  <Link href={getDashboardUrl()} onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/book-demo" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" variant="outline" className="w-full">
                      {locale === 'es' ? 'Agendar Demo' : 'Book a Demo'}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
