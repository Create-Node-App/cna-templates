'use client';

/**
 * Admin Page Header
 *
 * Consistent header for admin pages. Two variants:
 * - With backHref: compact style (back button + title + description + actions), like Manager.
 * - Without backHref: gradient hero panel (dashboard-style).
 */

import { ArrowLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui';

export interface AdminPageHeaderProps {
  title: string;
  description: string;
  /** When set, renders compact header with back link (like Manager subpages). */
  backHref?: string;
  backLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel,
  actionLabel,
  onAction,
  children,
}: AdminPageHeaderProps) {
  if (backHref != null) {
    return (
      <div className="space-y-1">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={backHref} className="hover:text-foreground transition-colors">
            {backLabel ?? 'Admin'}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{title}</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="shrink-0" aria-label={backLabel ?? 'Back'}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {children}
            {actionLabel != null && onAction != null && (
              <Button onClick={onAction} className="gap-2">
                <Plus className="h-4 w-4" />
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl brand-gradient text-white p-6 shadow-md">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-white/80">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {children}
          {actionLabel != null && onAction != null && (
            <Button
              onClick={onAction}
              className="gap-2 bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
