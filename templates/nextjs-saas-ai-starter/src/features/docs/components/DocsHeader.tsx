'use client';

import { BookOpen, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';

interface DocsHeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  sidebarOpen: boolean;
}

export function DocsHeader({ onToggleSidebar, onOpenSearch, sidebarOpen }: DocsHeaderProps) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile sidebar toggle */}
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo / Title */}
        <Link href="/docs" className="flex items-center gap-2 font-semibold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">{t('docs.title')}</span>
        </Link>

        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="ml-auto flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{t('docs.search.placeholder')}</span>
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-xs font-mono sm:inline">
            {'\u2318'}K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm">
              {t('docs.backToApp')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
