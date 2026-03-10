'use client';

/**
 * Section Header Component
 *
 * Unified header for sections within tabs/pages.
 * Provides consistent styling for section titles.
 */

import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional description/subtitle */
  description?: string;
  /** Optional actions (buttons) on the right */
  actions?: ReactNode;
  /** Additional className */
  className?: string;
}

export function SectionHeader({ title, icon, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-4 border-b border-border', className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon && <div className="h-5 w-5 shrink-0 text-primary">{icon}</div>}
          <h2 className="text-lg font-semibold leading-none tracking-tight text-foreground">{title}</h2>
        </div>
        {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}
