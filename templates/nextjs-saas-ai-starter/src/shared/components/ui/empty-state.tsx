'use client';

/**
 * Empty State Component
 *
 * Consistent empty state with colorful icons per domain, title, description,
 * and optional CTA button. Replaces generic "No data" messages across the app.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export type EmptyStateDomain =
  | 'default'
  | 'skill'
  | 'interest'
  | 'okr'
  | 'learning'
  | 'performance'
  | 'project'
  | 'recognition'
  | 'oneonone'
  | 'assistant'
  | 'people'
  | 'knowledge';

const domainStyles: Record<EmptyStateDomain, { iconBg: string; iconColor: string }> = {
  default: {
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
  },
  skill: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  interest: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  okr: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  learning: {
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  performance: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  project: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  recognition: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  oneonone: {
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  assistant: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  people: {
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  knowledge: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
};

export interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Main title */
  title: string;
  /** Descriptive text */
  description?: string;
  /** Domain for color styling */
  domain?: EmptyStateDomain;
  /** Optional CTA action (e.g., a Button or Link) */
  action?: ReactNode;
  /** Compact variant for smaller containers */
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  domain = 'default',
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  const styles = domainStyles[domain];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center entrance-fade',
        compact ? 'py-8 px-4 gap-3' : 'py-16 px-6 gap-4',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl',
          styles.iconBg,
          compact ? 'h-12 w-12' : 'h-16 w-16',
        )}
      >
        <Icon className={cn(styles.iconColor, compact ? 'h-6 w-6' : 'h-8 w-8')} />
      </div>
      <div className="space-y-1">
        <h3 className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-lg')}>{title}</h3>
        {description && (
          <p className={cn('text-muted-foreground max-w-sm mx-auto', compact ? 'text-xs' : 'text-sm')}>{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
