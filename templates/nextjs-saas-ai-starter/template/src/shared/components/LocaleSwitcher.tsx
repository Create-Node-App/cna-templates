'use client';

import { GlobeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useChangeLocale } from '@/i18n/client';
import { type Locale, localeNames, locales } from '@/i18n/config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';

// Render dropdown only after mount so server and first client render match (avoids Radix ID hydration mismatch)
function useAfterHydration() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  return mounted;
}

export function LocaleSwitcher() {
  const { locale, changeLocale, isPending } = useChangeLocale();
  const mounted = useAfterHydration();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" type="button" className="h-9 w-9">
        <GlobeIcon className="h-5 w-5" />
        <span className="sr-only">Change language</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <GlobeIcon className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => changeLocale(loc as Locale)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {localeNames[loc as Locale]}
            {locale === loc && ' ✓'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
