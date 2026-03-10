'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { cn } from '@/shared/lib/utils';

import { docSections } from '../lib/docs-navigation';

interface DocsSidebarProps {
  onNavigate?: () => void;
}

export function DocsSidebar({ onNavigate }: DocsSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const currentSlug = pathname.replace('/docs/', '').replace('/docs', '');

  // Default all sections to open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of docSections) {
      initial[section.id] = true;
    }
    return initial;
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav className="space-y-1" aria-label="Documentation navigation">
      {docSections.map((section) => {
        const Icon = section.icon;
        const isOpen = openSections[section.id] ?? true;
        const hasActivePage = section.pages.some((p) => p.slug === currentSlug);

        return (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors',
                hasActivePage ? 'text-primary' : 'text-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{t(section.titleKey)}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !isOpen && '-rotate-90')} />
            </button>

            {isOpen && (
              <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-3">
                {section.pages.map((page) => {
                  const isActive = page.slug === currentSlug;
                  return (
                    <li key={page.slug}>
                      <Link
                        href={`/docs/${page.slug}`}
                        onClick={onNavigate}
                        className={cn(
                          'block rounded-md px-2 py-1 text-sm transition-colors',
                          isActive
                            ? 'bg-primary/10 font-medium text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {t(page.titleKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
