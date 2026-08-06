'use client';

import { useLocale } from 'next-intl';
import { useCallback, useTransition } from 'react';
import { type Locale, LOCALE_COOKIE_NAME } from './config';

/**
 * Hook to get and set the current locale
 * Uses cookies for persistence (no URL change)
 */
export function useChangeLocale() {
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const changeLocale = useCallback((newLocale: Locale) => {
    startTransition(() => {
      // Set cookie
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      // Refresh the page to apply the new locale
      window.location.reload();
    });
  }, []);

  return {
    locale: currentLocale,
    changeLocale,
    isPending,
  };
}
