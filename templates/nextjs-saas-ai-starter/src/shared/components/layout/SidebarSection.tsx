'use client';

import { ChevronRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { useSidebarOptional } from '@/shared/providers';

type SectionVariant =
  | 'growth'
  | 'team'
  | 'knowledge'
  | 'settings'
  | 'default'
  | 'project'
  | 'okr'
  | 'learning'
  | 'recognition'
  | 'oneonone'
  | 'admin'
  | 'performance';

/**
 * Section variant styles — aligned with Design System domain colors.
 *
 * Cross-reference with SidebarNavItem.iconTintClasses and globals.css.
 * See docs/DESIGN_SYSTEM.md §4 "Domain Colors"
 */
const variantStyles: Record<SectionVariant, { bg: string; border: string; icon: string }> = {
  growth: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  team: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/50',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  knowledge: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-800/50',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  settings: {
    bg: 'bg-slate-50 dark:bg-slate-800/30',
    border: 'border-slate-200 dark:border-slate-700/50',
    icon: 'text-slate-600 dark:text-slate-400',
  },
  project: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800/50',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  okr: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  learning: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/50',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  recognition: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800/50',
    icon: 'text-rose-600 dark:text-rose-400',
  },
  oneonone: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-800/50',
    icon: 'text-teal-600 dark:text-teal-400',
  },
  admin: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800/50',
    icon: 'text-violet-600 dark:text-violet-400',
  },
  performance: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800/50',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  default: {
    bg: 'bg-muted/50',
    border: 'border-border/50',
    icon: 'text-muted-foreground',
  },
};

interface SidebarSectionProps {
  title: string;
  icon?: ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  children: ReactNode;
  className?: string;
  variant?: SectionVariant;
  /** When true (ClickUp-style collapsed sidebar), hide header and show only icon-only children */
  collapsed?: boolean;
}

export function SidebarSection({
  title,
  icon,
  defaultExpanded = true,
  collapsible = true,
  children,
  className,
  variant = 'default',
  collapsed = false,
}: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sidebarContext = useSidebarOptional();
  const isPeeking = sidebarContext?.isPeeking ?? false;
  const isSidebarCollapsed = collapsed || (sidebarContext?.isCollapsed ?? false);

  // When peeking, render in expanded mode (full labels + collapsible sections)
  const showCollapsedLayout = isSidebarCollapsed && !isPeeking;
  const styles = variantStyles[variant];

  // When sidebar is collapsed (and not peeking), show minimal icon-only layout
  if (showCollapsedLayout) {
    return (
      <div className={cn('space-y-0.5', className)}>
        {/* Minimal divider line with tooltip — clean, no colored box */}
        {icon && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="my-1.5 mx-1 flex items-center justify-center">
                <div className="h-px flex-1 bg-border/40" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{title}</TooltipContent>
          </Tooltip>
        )}
        <div className="space-y-0.5">{children}</div>
      </div>
    );
  }

  // Expanded layout (normal or peeking)
  return (
    <div className={cn('space-y-1', className)}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium',
            'text-muted-foreground transition-colors hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1',
          )}
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-90',
            )}
          />
          {icon && <span className={cn('flex shrink-0', styles.icon)}>{icon}</span>}
          <span className="flex-1 truncate">{title}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          {icon && <span className={cn('flex shrink-0', styles.icon)}>{icon}</span>}
          <span className="truncate">{title}</span>
        </div>
      )}
      <div
        className={cn(
          'space-y-0.5 pl-1 overflow-hidden transition-all duration-200',
          !collapsible || isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}
