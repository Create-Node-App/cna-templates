'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';

interface SidebarBottomActionsProps {
  tenantSlug?: string;
}

export function SidebarBottomActions({ tenantSlug: _tenantSlug }: SidebarBottomActionsProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        href="/docs"
        target="_blank"
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title={t('docs.title')}
        aria-label={t('docs.title')}
      >
        <BookOpen className="h-4 w-4" />
      </Link>
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
  );
}
