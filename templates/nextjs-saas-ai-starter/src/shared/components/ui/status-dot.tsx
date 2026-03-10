/**
 * Status Dot Component
 *
 * Animated colored dot for live status indicators.
 * Used for connection status, online status, sync state, etc.
 */

import { cn } from '@/shared/lib/utils';

export type StatusDotColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

const colorClasses: Record<StatusDotColor, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  neutral: 'bg-gray-400 dark:bg-gray-500',
  primary: 'bg-primary',
};

const pulseColorClasses: Record<StatusDotColor, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
  neutral: 'bg-gray-300 dark:bg-gray-400',
  primary: 'bg-primary/70',
};

export interface StatusDotProps {
  /** Color variant */
  color?: StatusDotColor;
  /** Animate with a subtle pulse */
  pulse?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional label text next to the dot */
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

const pulseSizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function StatusDot({ color = 'neutral', pulse = false, size = 'md', label, className }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative inline-flex">
        <span className={cn('rounded-full', sizeClasses[size], colorClasses[color])} />
        {pulse && (
          <span
            className={cn(
              'absolute inset-0 rounded-full opacity-75 status-dot-pulse',
              pulseSizeClasses[size],
              pulseColorClasses[color],
            )}
          />
        )}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
