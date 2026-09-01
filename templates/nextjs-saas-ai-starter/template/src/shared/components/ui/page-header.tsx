'use client';

/**
 * Page Header Component
 *
 * Compact, unified header component for all pages with consistent styling.
 * Provides context without taking too much vertical space.
 */

import { ChevronRight, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { type CardAccent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  href?: string;
}

export interface StepItem {
  number: number;
  label: string;
  active?: boolean;
  completed?: boolean;
}

export interface PageHeaderProps {
  /** Breadcrumb navigation */
  breadcrumb?: {
    backTo: string;
    backLabel: string;
    current: string;
  };

  /** Header variant - compact is default, hero for special pages */
  variant?: 'compact' | 'hero' | 'minimal';

  /** Main icon (left side) */
  icon?: ReactNode;

  /** Badge/tag displayed next to icon */
  badge?: string;

  /** Main title (H1) */
  title: string;

  /** Subtitle/description - shown in compact variant */
  description?: string;

  /** Primary actions (buttons) */
  actions?: ReactNode;

  /** User info section (for profile pages) - only in hero variant */
  userInfo?: {
    avatar?: string;
    initials: string;
    name: string;
    email?: string;
    title?: string;
    department?: string;
  };

  /** Tabs for sub-navigation */
  tabs?: TabItem[];

  /** Steps indicator (for wizards) */
  steps?: StepItem[];

  /** Inline KPI metrics displayed in the header */
  metrics?: Array<{ label: string; value: string | number }>;

  /** Colored left accent strip for compact variant (domain categorization) */
  accent?: CardAccent;

  /** Additional className */
  className?: string;
}

const accentBorderClasses: Partial<Record<CardAccent, string>> = {
  skill: 'border-l-[3px] border-l-primary',
  interest: 'border-l-[3px] border-l-amber-500 dark:border-l-amber-400',
  okr: 'border-l-[3px] border-l-emerald-500 dark:border-l-emerald-400',
  learning: 'border-l-[3px] border-l-cyan-500 dark:border-l-cyan-400',
  performance: 'border-l-[3px] border-l-orange-500 dark:border-l-orange-400',
  recognition: 'border-l-[3px] border-l-rose-500 dark:border-l-rose-400',
  project: 'border-l-[3px] border-l-indigo-500 dark:border-l-indigo-400',
  oneonone: 'border-l-[3px] border-l-teal-500 dark:border-l-teal-400',
};

export function PageHeader({
  breadcrumb,
  variant = 'compact',
  icon,
  badge,
  title,
  description,
  actions,
  userInfo,
  tabs,
  steps,
  metrics,
  accent,
  className,
}: PageHeaderProps) {
  const isHero = variant === 'hero';
  const isMinimal = variant === 'minimal';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumb Navigation - only if not minimal */}
      {breadcrumb && !isMinimal && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={breadcrumb.backTo} className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            {breadcrumb.backLabel}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{breadcrumb.current}</span>
        </nav>
      )}

      {/* Main Header */}
      {/* Main Header — hero uses brand gradient (the ONE gradient), compact uses card surface.
           See DESIGN_SYSTEM.md Section 8.4: "The Brand Moment" */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg entrance-fade',
          isHero && 'brand-gradient text-white p-6',
          variant === 'compact' && 'bg-card border border-border shadow-sm p-4',
          variant === 'compact' && accent && accentBorderClasses[accent],
          isMinimal && 'p-0',
        )}
      >
        {/* Subtle radial overlay for hero — single, restrained, not multiple animated blobs */}
        {isHero && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
        )}

        <div className="relative">
          {/* User Info Layout (Profile variant - hero only) */}
          {userInfo && isHero ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg overflow-hidden">
                  {userInfo.avatar ? (
                    <Image src={userInfo.avatar} alt={userInfo.name} fill className="object-cover" unoptimized />
                  ) : (
                    <span className="text-2xl font-bold text-white">{userInfo.initials}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">{userInfo.name}</h1>
                  {userInfo.email && (
                    <div className="flex items-center gap-2 text-white/80 mt-1 text-sm">
                      <span>{userInfo.email}</span>
                    </div>
                  )}
                  {userInfo.title && (
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <span>
                        {userInfo.title}
                        {userInfo.department && ` • ${userInfo.department}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
            </div>
          ) : (
            /* Compact/Standard Layout */
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Icon */}
                {icon && (
                  <div
                    className={cn(
                      'flex items-center justify-center shrink-0',
                      isHero
                        ? 'h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm'
                        : 'h-10 w-10 rounded-lg bg-primary/10 text-primary',
                    )}
                  >
                    <div className="h-5 w-5">{icon}</div>
                  </div>
                )}
                {/* Title + Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className={cn('text-xl font-bold tracking-tight', isHero ? 'text-white' : 'text-foreground')}>
                      {title}
                    </h1>
                    {badge && (
                      <Badge
                        className={cn(
                          isHero
                            ? 'bg-white/20 text-white border-0 backdrop-blur-sm'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {badge}
                      </Badge>
                    )}
                  </div>
                  {description && (
                    <p
                      className={cn('text-sm mt-0.5 line-clamp-1', isHero ? 'text-white/80' : 'text-muted-foreground')}
                    >
                      {description}
                    </p>
                  )}
                  {metrics && metrics.length > 0 && (
                    <div className="flex items-center gap-3 mt-1.5">
                      {metrics.map((metric, i) => (
                        <span key={i} className={cn('text-xs', isHero ? 'text-white/70' : 'text-muted-foreground')}>
                          <span className={cn('font-semibold', isHero ? 'text-white' : 'text-foreground')}>
                            {metric.value}
                          </span>{' '}
                          {metric.label}
                          {i < metrics.length - 1 && (
                            <span className={cn('ml-3', isHero ? 'text-white/30' : 'text-border')}>|</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Actions */}
              {actions && <div className="flex gap-2 shrink-0 flex-wrap">{actions}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Steps Indicator (for wizards) */}
      {steps && steps.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    step.completed
                      ? 'bg-primary text-primary-foreground border-primary'
                      : step.active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-muted',
                  )}
                >
                  {step.completed ? '✓' : step.number}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium whitespace-nowrap',
                    step.active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn('h-0.5 w-6', step.completed ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabs Navigation */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {tabs.map((tab) => {
            const content = (
              <div className="flex items-center gap-2 whitespace-nowrap">
                {tab.icon && <span className="h-4 w-4 shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </div>
            );

            if (tab.href) {
              return (
                <Link
                  key={tab.value}
                  href={tab.href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={tab.value}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted"
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
