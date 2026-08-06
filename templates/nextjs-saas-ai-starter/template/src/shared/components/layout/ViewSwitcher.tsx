'use client';

import { ChevronDown, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ReactNode, useSyncExternalStore } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { useSidebarOptional, useViewOptional, type ViewType } from '@/shared/providers';

interface ViewSwitcherProps {
  tenantSlug: string;
}

interface ViewConfig {
  id: ViewType;
  labelKey: string;
  icon: ReactNode;
  basePath: string;
  color: string;
}

/**
 * View switcher component for the sidebar
 *
 * Shows available views based on permissions and allows switching between them.
 * When sidebar is collapsed, shows only icons with tooltips.
 */
export function ViewSwitcher({ tenantSlug }: ViewSwitcherProps) {
  const router = useRouter();
  const t = useTranslations('nav');
  const viewContext = useViewOptional();
  const sidebarContext = useSidebarOptional();
  // Defer Radix UI until after mount to avoid server/client ID mismatch (hydration)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isPeeking = sidebarContext?.isPeeking ?? false;
  // When peeking, render the expanded (full-width) dropdown
  const isCollapsed = (sidebarContext?.isCollapsed ?? false) && !isPeeking;

  // If no view context (e.g., not wrapped in ViewProvider), don't render
  if (!viewContext) {
    return null;
  }

  const { currentView, availableViews } = viewContext;

  const views: ViewConfig[] = [
    {
      id: 'my',
      labelKey: 'viewMy',
      icon: <User className="h-4 w-4" />,
      basePath: `/t/${tenantSlug}`,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'admin',
      labelKey: 'viewAdmin',
      icon: <Shield className="h-4 w-4" />,
      basePath: `/t/${tenantSlug}/admin`,
      color: 'text-violet-600 dark:text-violet-400',
    },
  ];

  const filteredViews = views.filter((v) => availableViews.includes(v.id));
  const currentViewConfig = views.find((v) => v.id === currentView) ?? views[0];

  const handleViewChange = (view: ViewConfig) => {
    // Only navigate — the view provider derives currentView from the URL,
    // so the sidebar updates in sync with the page content (no jarring flash).
    router.push(view.basePath);
  };

  // Only show switcher if more than one view is available
  if (filteredViews.length <= 1) {
    return null;
  }

  // Before mount: render static trigger only (no Radix) to avoid hydration mismatch
  if (!mounted) {
    if (isCollapsed) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-10 w-10', currentViewConfig.color)}
          aria-label={t('switchView')}
        >
          {currentViewConfig.icon}
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        className={cn('w-full justify-between gap-2 border-border/50 bg-muted/30 hover:bg-muted/50', 'h-10 px-3')}
        aria-label={t('switchView')}
      >
        <span className="flex items-center gap-2">
          <span className={currentViewConfig.color}>{currentViewConfig.icon}</span>
          <span className="font-medium">{t(currentViewConfig.labelKey)}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  // Collapsed mode - show icon button with tooltip
  if (isCollapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-10 w-10', currentViewConfig.color)}
                aria-label={t('switchView')}
              >
                {currentViewConfig.icon}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{t('switchView')}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" side="right" className="w-48">
          {filteredViews.map((view) => (
            <DropdownMenuItem
              key={view.id}
              onClick={() => handleViewChange(view)}
              className={cn('gap-2 cursor-pointer', currentView === view.id && 'bg-accent')}
            >
              <span className={view.color}>{view.icon}</span>
              {t(view.labelKey)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Expanded mode - show full dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-between gap-2 border-border/50 bg-muted/30 hover:bg-muted/50', 'h-10 px-3')}
          aria-label={t('switchView')}
        >
          <span className="flex items-center gap-2">
            <span className={currentViewConfig.color}>{currentViewConfig.icon}</span>
            <span className="font-medium">{t(currentViewConfig.labelKey)}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {filteredViews.map((view) => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => handleViewChange(view)}
            className={cn('gap-2 cursor-pointer', currentView === view.id && 'bg-accent')}
          >
            <span className={view.color}>{view.icon}</span>
            {t(view.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
