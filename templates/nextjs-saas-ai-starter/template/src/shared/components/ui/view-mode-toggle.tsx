'use client';

/**
 * View Mode Toggle (List / Radar)
 *
 * Atom: segmented control to switch between list and radar chart views.
 * Used in TopSkills, PersonMatchCard, and similar views.
 */

import { List, Radar } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export type ViewMode = 'list' | 'radar';

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  listLabel?: string;
  radarLabel?: string;
  className?: string;
}

export function ViewModeToggle({
  value,
  onChange,
  listLabel = 'List',
  radarLabel = 'Radar',
  className,
}: ViewModeToggleProps) {
  return (
    <div className={cn('flex gap-1 rounded-lg border bg-muted p-1', className)} role="group" aria-label="View mode">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange('list')}
        className={cn(
          'h-8 px-3 transition-all duration-150 border-2',
          value === 'list'
            ? 'border-secondary shadow-md ring-2 ring-secondary/30 text-secondary font-semibold'
            : 'border-transparent text-muted-foreground hover:bg-muted',
        )}
        aria-pressed={value === 'list'}
      >
        <List className="h-4 w-4 mr-1" aria-hidden />
        {listLabel}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange('radar')}
        className={cn(
          'h-8 px-3 transition-all duration-150 border-2',
          value === 'radar'
            ? 'border-secondary shadow-md ring-2 ring-secondary/30 text-secondary font-semibold'
            : 'border-transparent text-muted-foreground hover:bg-muted',
        )}
        aria-pressed={value === 'radar'}
      >
        <Radar className="h-4 w-4 mr-1" aria-hidden />
        {radarLabel}
      </Button>
    </div>
  );
}
