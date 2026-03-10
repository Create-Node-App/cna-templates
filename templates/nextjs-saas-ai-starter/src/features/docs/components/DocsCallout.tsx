'use client';

import { AlertCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

type CalloutVariant = 'info' | 'tip' | 'warning' | 'danger';

interface DocsCalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

const variantConfig: Record<CalloutVariant, { icon: React.ElementType; className: string }> = {
  info: {
    icon: Info,
    className: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-200',
  },
  tip: {
    icon: Lightbulb,
    className: 'border-green-500/30 bg-green-50/50 dark:bg-green-500/10 text-green-900 dark:text-green-200',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/10 text-yellow-900 dark:text-yellow-200',
  },
  danger: {
    icon: AlertCircle,
    className: 'border-red-500/30 bg-red-50/50 dark:bg-red-500/10 text-red-900 dark:text-red-200',
  },
};

export function DocsCallout({ variant = 'info', title, children }: DocsCalloutProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn('my-4 rounded-lg border p-4', config.className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          {title && <p className="mb-1 font-semibold">{title}</p>}
          <div className="text-sm [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
