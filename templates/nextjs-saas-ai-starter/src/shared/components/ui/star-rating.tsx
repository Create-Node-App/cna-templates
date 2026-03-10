'use client';

import { Heart, Star } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface StarRatingProps {
  value: number;
  maxValue?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'skill' | 'interest';
  showEmpty?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StarRating({
  value,
  maxValue = 5,
  onChange,
  readonly = true,
  size = 'md',
  variant = 'skill',
  showEmpty = true,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const Icon = variant === 'interest' ? Heart : Star;
  const filledColor = variant === 'interest' ? 'text-rose-500 fill-rose-500' : 'text-amber-400 fill-amber-400';
  const emptyColor = variant === 'interest' ? 'text-rose-200 dark:text-rose-900' : 'text-muted-foreground/30';

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      onMouseLeave={() => !readonly && setHoverValue(null)}
      role="group"
      aria-label={`Rating: ${value} out of ${maxValue}`}
    >
      {Array.from({ length: maxValue }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayValue;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              isFilled ? filledColor : showEmpty ? emptyColor : 'hidden',
            )}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
          >
            <Icon className={cn(sizeClasses[size], isFilled && 'fill-current')} />
          </button>
        );
      })}
    </div>
  );
}
