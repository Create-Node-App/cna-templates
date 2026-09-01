'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { getBreadcrumbs } from '../lib/docs-navigation';

interface DocsBreadcrumbProps {
  slug: string;
}

export function DocsBreadcrumb({ slug }: DocsBreadcrumbProps) {
  const t = useTranslations();
  const crumbs = getBreadcrumbs(slug);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {isLast || !crumb.slug ? (
              <span className={isLast ? 'font-medium text-foreground' : ''}>{t(crumb.titleKey)}</span>
            ) : (
              <Link href={`/docs/${crumb.slug}`} className="transition-colors hover:text-foreground">
                {t(crumb.titleKey)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
