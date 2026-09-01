'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export type ProgressColor =
  | 'default'
  | 'gradient'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'learning'
  | 'okr'
  | 'recognition';

/**
 * Progress color variants — use solid domain colors, not gradients.
 * Design System Principle 1.2: "Color Encodes Meaning"
 */
const colorClasses: Record<ProgressColor, string> = {
  default: 'bg-primary',
  gradient: 'bg-primary', // Gradient removed — use solid primary per design system
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  info: 'bg-info',
  learning: 'bg-[hsl(var(--domain-learning))]',
  okr: 'bg-[hsl(var(--domain-okr))]',
  recognition: 'bg-[hsl(var(--domain-recognition))]',
};

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Color variant for the progress bar fill */
  color?: ProgressColor;
  /** Show animated stripe pattern for active/in-progress state */
  striped?: boolean;
  /** Show percentage label overlay */
  showLabel?: boolean;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, color = 'default', striped = false, showLabel = false, ...props }, ref) => {
    const normalizedValue = value || 0;
    const isComplete = normalizedValue >= 100;

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', showLabel && 'h-5', className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 rounded-full transition-all duration-700 ease-out',
            colorClasses[color],
            striped && 'progress-striped',
            isComplete && 'animate-[progress-glow_1s_ease-in-out_2]',
          )}
          style={{
            transform: `translateX(-${100 - normalizedValue}%)`,
            animation: `progress-fill 0.8s 0.3s ease-out both${isComplete ? ', progress-glow 1s 1.2s ease-in-out 2' : ''}`,
          }}
        />
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
            {Math.round(normalizedValue)}%
          </span>
        )}
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
