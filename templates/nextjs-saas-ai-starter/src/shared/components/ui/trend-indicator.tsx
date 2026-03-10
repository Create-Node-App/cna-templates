/**
 * Trend Indicator Component
 *
 * Arrow up/down/neutral with value and color coding.
 * Used in stat cards and dashboard widgets to show metric trends.
 */

import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface TrendIndicatorProps {
  /** Direction of the trend */
  direction: TrendDirection;
  /** Value to display (e.g., "+12%", "3 more") */
  value: string;
  /** Invert colors: down is good (e.g., for bugs, incidents) */
  invertColors?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  className?: string;
}

export function TrendIndicator({
  direction,
  value,
  invertColors = false,
  size = 'sm',
  className,
}: TrendIndicatorProps) {
  const isPositive = invertColors ? direction === 'down' : direction === 'up';
  const isNegative = invertColors ? direction === 'up' : direction === 'down';

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-medium',
        textSize,
        isPositive && 'text-emerald-600 dark:text-emerald-400',
        isNegative && 'text-red-500 dark:text-red-400',
        direction === 'neutral' && 'text-muted-foreground',
        className,
      )}
    >
      {direction === 'up' && <ArrowUp className={iconSize} />}
      {direction === 'down' && <ArrowDown className={iconSize} />}
      {direction === 'neutral' && <ArrowRight className={iconSize} />}
      {value}
    </span>
  );
}
