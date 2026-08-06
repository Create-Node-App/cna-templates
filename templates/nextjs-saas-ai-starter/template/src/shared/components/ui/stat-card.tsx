'use client';

/**
 * Stat Card Component
 *
 * Reusable metric card with icon, value, label, trend indicator, and optional
 * color variant. Used across all dashboards (member, manager, admin, 1:1).
 */

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import { type TrendDirection, TrendIndicator } from './trend-indicator';

export type StatCardVariant =
  | 'default'
  | 'primary'
  | 'skill'
  | 'interest'
  | 'okr'
  | 'learning'
  | 'performance'
  | 'project'
  | 'recognition'
  | 'oneonone';

/**
 * Stat card variant styles — elevation + accent, not gradients.
 * Design System Section 8.1 "Domain Accent Bar" + Section 9.5 "Stat Cards"
 *
 * Icon gets a subtle domain-color background circle (solid, 10% opacity).
 * Primary variant: solid primary bg with white text.
 */
const variantStyles: Record<StatCardVariant, { iconBg: string; iconColor: string; accentBorder?: string }> = {
  default: {
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
  },
  primary: {
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    accentBorder: 'border-l-[3px] border-l-primary',
  },
  skill: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    accentBorder: 'border-l-[3px] border-l-purple-500 dark:border-l-purple-400',
  },
  interest: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accentBorder: 'border-l-[3px] border-l-amber-500 dark:border-l-amber-400',
  },
  okr: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accentBorder: 'border-l-[3px] border-l-emerald-500 dark:border-l-emerald-400',
  },
  learning: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accentBorder: 'border-l-[3px] border-l-blue-500 dark:border-l-blue-400',
  },
  performance: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    accentBorder: 'border-l-[3px] border-l-orange-500 dark:border-l-orange-400',
  },
  project: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    accentBorder: 'border-l-[3px] border-l-indigo-500 dark:border-l-indigo-400',
  },
  recognition: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    accentBorder: 'border-l-[3px] border-l-rose-500 dark:border-l-rose-400',
  },
  oneonone: {
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    accentBorder: 'border-l-[3px] border-l-teal-500 dark:border-l-teal-400',
  },
};

export interface StatCardProps {
  /** Icon from lucide-react */
  icon: LucideIcon;
  /** Main numeric value */
  value: string | number;
  /** Label/description text */
  label: string;
  /** Color variant */
  variant?: StatCardVariant;
  /** Trend direction and value */
  trend?: {
    direction: TrendDirection;
    value: string;
  };
  /** Optional suffix after the value (e.g., "%", "skills") */
  valueSuffix?: string;
  /** Link destination when card is clicked */
  href?: string;
  /** Extra content below the label */
  footer?: ReactNode;
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  variant = 'default',
  trend,
  valueSuffix,
  href,
  footer,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={cn('flex items-center justify-center h-10 w-10 rounded-lg', styles.iconBg)}>
          <Icon className={cn('h-5 w-5', styles.iconColor)} />
        </div>
        {trend && <TrendIndicator direction={trend.direction} value={trend.value} />}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
          {valueSuffix && <span className="text-sm text-muted-foreground">{valueSuffix}</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
      {footer && <div className="pt-2 border-t border-border">{footer}</div>}
    </div>
  );

  const wrapperClass = cn(
    'rounded-xl border border-border bg-card text-card-foreground shadow-sm card-interactive entrance-fade',
    styles.accentBorder,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(wrapperClass, 'block')}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
