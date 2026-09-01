'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/lib/utils';

import type { DocNavItem } from '../types';

interface DocsPaginationProps {
  prev: DocNavItem | null;
  next: DocNavItem | null;
}

export function DocsPagination({ prev, next }: DocsPaginationProps) {
  const t = useTranslations();

  if (!prev && !next) return null;

  return (
    <nav aria-label="Documentation pagination" className="mt-12 flex items-stretch gap-4 border-t border-border pt-6">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className={cn(
            'group flex flex-1 flex-col items-start rounded-lg border border-border p-4 transition-all',
            'hover:border-primary/50 hover:bg-muted/50',
          )}
        >
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <ArrowLeft className="h-3 w-3" />
            {t('docs.pagination.previous')}
          </span>
          <span className="mt-1 text-sm font-medium text-foreground group-hover:text-primary">{t(prev.titleKey)}</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className={cn(
            'group flex flex-1 flex-col items-end rounded-lg border border-border p-4 transition-all',
            'hover:border-primary/50 hover:bg-muted/50',
          )}
        >
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {t('docs.pagination.next')}
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="mt-1 text-sm font-medium text-foreground group-hover:text-primary">{t(next.titleKey)}</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
