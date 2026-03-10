'use client';

import { ChevronLeft, ChevronRight, Pin, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { useSidebarOptional, useViewOptional } from '@/shared/providers';

import { AdminViewNav, MyViewNav } from './nav';
import { SidebarBottomActions } from './SidebarBottomActions';
import { SidebarUserMenu } from './SidebarUserMenu';
import { ViewSwitcher } from './ViewSwitcher';
import { AppLogo } from '../brand/Logo';

interface UnifiedSidebarProps {
  tenantSlug?: string;
  /** Fallback when session.user.permissions is not yet available */
  permissions?: string[];
}

/**
 * Unified sidebar that renders navigation based on current view.
 *
 * Features:
 * - Single sidebar component for all views (My, Admin)
 * - View switcher to navigate between views
 * - Collapsible on desktop with hover-to-expand peek overlay
 * - Keyboard shortcut (Cmd+\ / Ctrl+\) to toggle
 * - Mobile-responsive with drawer
 *
 * On desktop, user menu and utility actions live in TopHeader —
 * the sidebar is dedicated to navigation only.
 */
export function UnifiedSidebar({ tenantSlug, permissions: permissionsProp }: UnifiedSidebarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');

  // Sidebar collapse + peek state (from context, with fallback)
  const sidebarContext = useSidebarOptional();
  const isCollapsed = sidebarContext?.isCollapsed ?? false;
  const isPeeking = sidebarContext?.isPeeking ?? false;
  const setIsPeeking = sidebarContext?.setIsPeeking;
  const toggleCollapsed = sidebarContext?.toggleCollapsed;

  // View context for view-based rendering
  const viewContext = useViewOptional();
  const currentView = viewContext?.currentView ?? 'my';

  const basePath = tenantSlug ? `/t/${tenantSlug}` : '';

  // Prefer permissions from session (filled by auth callback); fallback to prop from layout
  const permissions = useMemo(() => {
    if (tenantSlug && user?.permissions?.[tenantSlug]?.length) return user.permissions[tenantSlug];
    return permissionsProp ?? [];
  }, [tenantSlug, user?.permissions, permissionsProp]);

  // --- Hover-to-expand (peek) logic ---
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (!isCollapsed || !setIsPeeking) return;
    // Delay 200ms to prevent accidental triggers
    peekTimeoutRef.current = setTimeout(() => {
      setIsPeeking(true);
    }, 200);
  }, [isCollapsed, setIsPeeking]);

  const handleMouseLeave = useCallback(() => {
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    setIsPeeking?.(false);
  }, [setIsPeeking]);

  // Whether the sidebar should render in "expanded" visual mode
  // (either actually expanded, or peeking as overlay)
  const showExpanded = !isCollapsed || isPeeking;

  // Get header title and icon based on current view
  const viewHeaderConfig = useMemo(() => {
    switch (currentView) {
      case 'admin':
        return {
          title: t('adminPanel'),
          icon: <Settings className="h-6 w-6 shrink-0 text-primary" />,
          href: `${basePath}/admin`,
        };
      default:
        return {
          title: null,
          icon: null,
          href: basePath || '/',
        };
    }
  }, [currentView, basePath, t]);

  // Show "back to main app" link in non-my views
  const showBackLink = currentView !== 'my';

  // Render navigation content based on current view
  const renderNavContent = (onItemClick?: () => void) => {
    switch (currentView) {
      case 'admin':
        return <AdminViewNav basePath={basePath} permissions={permissions} onItemClick={onItemClick} />;
      default:
        return <MyViewNav basePath={basePath} onItemClick={onItemClick} />;
    }
  };

  // Toggle button content depends on state
  const toggleIcon = isPeeking ? (
    <Pin className="h-4 w-4" />
  ) : isCollapsed ? (
    <ChevronRight className="h-4 w-4" />
  ) : (
    <ChevronLeft className="h-4 w-4" />
  );
  const toggleLabel = isPeeking ? 'Pin sidebar open' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop Sidebar — navigation only, no user/utility chrome */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:border-r lg:border-border/80 lg:bg-card transition-[width,box-shadow] duration-200 ease-out',
          // When peeking, expand to full width and float as overlay with shadow
          isPeeking && isCollapsed && 'lg:w-64 lg:shadow-2xl lg:z-[60]',
          // Normal collapsed
          isCollapsed && !isPeeking && 'lg:w-16 lg:shadow-sm',
          // Normal expanded
          !isCollapsed && 'lg:w-64 lg:shadow-sm',
        )}
      >
        {/* Header: Logo (for "my") or View Title (for other views) + Collapse Toggle */}
        <div
          className={cn(
            'relative flex h-16 shrink-0 items-center border-b border-border/80 px-3',
            showExpanded ? 'justify-between' : 'justify-center',
          )}
        >
          {/* Gradient accent stripe */}
          {/* Subtle brand gradient accent at top — the only sidebar decoration */}
          <div className="absolute top-0 left-0 right-0 h-0.5 brand-gradient" aria-hidden />

          {showExpanded ? (
            <>
              {viewHeaderConfig.title ? (
                <a href={viewHeaderConfig.href} className="flex items-center gap-2 min-w-0">
                  {viewHeaderConfig.icon}
                  <span className="font-semibold text-foreground truncate">{viewHeaderConfig.title}</span>
                </a>
              ) : (
                <AppLogo href={basePath || '/'} showText size="md" />
              )}
              {toggleCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleCollapsed}
                      className="h-8 w-8 shrink-0"
                      aria-label={toggleLabel}
                    >
                      {toggleIcon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{toggleLabel}</TooltipContent>
                </Tooltip>
              )}
            </>
          ) : (
            /* Collapsed: just logo icon centered, toggle on hover via peek */
            <AppLogo href={basePath || '/'} showText={false} size="md" />
          )}
        </div>

        {/* View Switcher */}
        {tenantSlug && (
          <div className="shrink-0 border-b border-border/80 px-3 py-2">
            <ViewSwitcher tenantSlug={tenantSlug} />
          </div>
        )}

        {/* Navigation — key on currentView so React re-mounts with entrance animation */}
        {tenantSlug && (
          <nav
            key={currentView}
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-y-auto py-4 animate-in fade-in duration-200',
              showExpanded ? 'gap-4 px-3' : 'gap-1 px-1.5',
            )}
            aria-label="Main navigation"
          >
            {renderNavContent()}
          </nav>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card lg:hidden">
        <div className="flex items-center gap-2 px-4">
          <Link href={viewHeaderConfig.href} className="flex items-center gap-2">
            {viewHeaderConfig.title ? (
              <>
                {viewHeaderConfig.icon}
                <span className="font-semibold">{viewHeaderConfig.title}</span>
              </>
            ) : (
              <AppLogo size="md" href={null} />
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2 px-4">
          <SidebarBottomActions tenantSlug={tenantSlug} />
          {user && (
            <SidebarUserMenu
              user={user}
              tenantSlug={tenantSlug}
              showBackLink={showBackLink}
              showProfileLink={!showBackLink}
              isCompact
            />
          )}
          {tenantSlug && (
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <span className="sr-only">Open menu</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {tenantSlug && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="flex w-72 flex-col p-0">
            <SheetHeader className="shrink-0 border-b border-border/80 px-6 pr-12 py-4">
              <SheetTitle className="flex items-center gap-2">
                {viewHeaderConfig.title ? (
                  <>
                    {viewHeaderConfig.icon}
                    <span>{viewHeaderConfig.title}</span>
                  </>
                ) : (
                  <AppLogo href={basePath || '/'} size="md" />
                )}
              </SheetTitle>
            </SheetHeader>

            {/* View Switcher in mobile */}
            <div className="shrink-0 border-b border-border/80 px-4 py-2">
              <ViewSwitcher tenantSlug={tenantSlug} />
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
              {renderNavContent(() => setMobileMenuOpen(false))}
            </nav>

            {/* Mobile drawer footer — user menu + utilities (not shown on desktop) */}
            <div className="shrink-0 border-t border-border/80 p-4">
              <SidebarUserMenu
                user={user ?? null}
                tenantSlug={tenantSlug}
                showBackLink={showBackLink}
                showProfileLink={!showBackLink}
                onItemClick={() => setMobileMenuOpen(false)}
              />
              <div className="mt-3">
                <SidebarBottomActions tenantSlug={tenantSlug} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </TooltipProvider>
  );
}
