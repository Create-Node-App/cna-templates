import * as React from 'react';

import { cn } from '@/shared/lib/utils';

/** Accent color variants for domain-specific card accents */
export type CardAccent =
  | 'skill'
  | 'interest'
  | 'okr'
  | 'learning'
  | 'performance'
  | 'recognition'
  | 'project'
  | 'oneonone'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive';

const accentClasses: Record<CardAccent, string> = {
  skill: 'border-l-[3px] border-l-primary',
  interest: 'border-l-[3px] border-l-amber-500 dark:border-l-amber-400',
  okr: 'border-l-[3px] border-l-emerald-500 dark:border-l-emerald-400',
  learning: 'border-l-[3px] border-l-cyan-500 dark:border-l-cyan-400',
  performance: 'border-l-[3px] border-l-orange-500 dark:border-l-orange-400',
  recognition: 'border-l-[3px] border-l-rose-500 dark:border-l-rose-400',
  project: 'border-l-[3px] border-l-indigo-500 dark:border-l-indigo-400',
  oneonone: 'border-l-[3px] border-l-teal-500 dark:border-l-teal-400',
  success: 'border-l-[3px] border-l-emerald-500 dark:border-l-emerald-400',
  warning: 'border-l-[3px] border-l-amber-500 dark:border-l-amber-400',
  info: 'border-l-[3px] border-l-sky-500 dark:border-l-sky-400',
  destructive: 'border-l-[3px] border-l-red-500 dark:border-l-red-400',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional colored left-border accent strip for domain categorization */
  accent?: CardAccent;
  /** Make card interactive with hover lift + border glow */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, accent, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
      accent && accentClasses[accent],
      interactive && 'card-interactive cursor-pointer',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
