'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { useSidebarOptional } from '@/shared/providers';

/** Icon color tint for domain-specific nav items */
export type NavIconTint =
  | 'default'
  | 'primary'
  | 'skill'
  | 'interest'
  | 'okr'
  | 'learning'
  | 'performance'
  | 'project'
  | 'recognition'
  | 'oneonone'
  | 'admin'
  | 'team'
  | 'knowledge'
  | 'assistant';

/**
 * Icon tint classes aligned with the Design System domain colors.
 *
 * Cross-reference with globals.css domain color tokens:
 *   skill → violet (oklch 55% 0.18 290) → violet-500
 *   interest → amber (oklch 70% 0.16 75) → amber-500
 *   okr → emerald (HSL 155) → emerald-500
 *   learning → blue (HSL 210) → blue-500
 *   performance → orange (HSL 30) → orange-500
 *   project → indigo (HSL 245) → indigo-500
 *   recognition → rose (HSL 350) → rose-500
 *   oneonone → teal (HSL 175) → teal-500
 *   admin → violet → violet-600
 *   team → blue → blue-500
 *   knowledge → sky (distinct from interest amber) → sky-500
 *   assistant → violet → violet-500
 *
 * See docs/DESIGN_SYSTEM.md §4 "Domain Colors"
 */
const iconTintClasses: Record<NavIconTint, string> = {
  default: '',
  primary: 'text-primary',
  skill: 'text-violet-500 dark:text-violet-400',
  interest: 'text-amber-500 dark:text-amber-400',
  okr: 'text-emerald-500 dark:text-emerald-400',
  learning: 'text-blue-500 dark:text-blue-400',
  performance: 'text-orange-500 dark:text-orange-400',
  project: 'text-indigo-500 dark:text-indigo-400',
  recognition: 'text-rose-500 dark:text-rose-400',
  oneonone: 'text-teal-500 dark:text-teal-400',
  admin: 'text-violet-600 dark:text-violet-400',
  team: 'text-blue-500 dark:text-blue-400',
  knowledge: 'text-sky-500 dark:text-sky-400',
  assistant: 'text-violet-500 dark:text-violet-400',
};

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
  badge?: string | number;
  /** Show a colored notification dot */
  notificationDot?: boolean;
  /** Icon color tint for domain-specific items */
  iconTint?: NavIconTint;
  onClick?: () => void;
  /** When true, show only icon and wrap in tooltip (ClickUp-style collapsed sidebar) */
  collapsed?: boolean;
  'data-tutorial'?: string;
}

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  exact,
  badge,
  notificationDot,
  iconTint = 'default',
  onClick,
  collapsed = false,
  'data-tutorial': dataTutorial,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sidebarContext = useSidebarOptional();
  const isPeeking = sidebarContext?.isPeeking ?? false;
  // When peeking, render as expanded (show labels) even though isCollapsed is true
  const isCollapsed = collapsed || ((sidebarContext?.isCollapsed ?? false) && !isPeeking);

  const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
  const isActive = exact
    ? fullPath === href || fullPath === href + '?tab=overview'
    : href.includes('?')
      ? fullPath === href
      : fullPath.startsWith(href);

  const linkContent = (
    <Link
      href={href}
      onClick={onClick}
      data-tutorial={dataTutorial}
      className={cn(
        'relative flex items-center gap-3 rounded-lg py-2.5 text-sm transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
        isCollapsed ? 'justify-center px-2' : 'px-3',
        isActive
          ? 'bg-primary/10 text-primary font-medium border-l-2 border-l-primary'
          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground border-l-2 border-l-transparent',
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={isCollapsed ? label : undefined}
    >
      {Icon && (
        <span className="relative shrink-0">
          <Icon
            className={cn(
              'h-5 w-5',
              isActive ? 'text-primary' : iconTint !== 'default' ? iconTintClasses[iconTint] : 'opacity-90',
            )}
            aria-hidden
          />
          {notificationDot && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 status-dot-pulse" />
          )}
        </span>
      )}
      {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
      {!isCollapsed && badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
          {badge}
        </span>
      )}
    </Link>
  );

  // When collapsed, wrap in tooltip
  if (isCollapsed && Icon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {label}
          {badge && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
