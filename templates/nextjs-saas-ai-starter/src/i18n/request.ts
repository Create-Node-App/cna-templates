import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale, LOCALE_COOKIE_NAME, locales } from './config';

/**
 * Detect locale from various sources:
 * 1. Cookie (user preference)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale
 */
async function detectLocale(): Promise<Locale> {
  // 1. Check cookie first (user's explicit choice)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME);
  if (localeCookie && locales.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale;
  }

  // 2. Check Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header and find best match
    const browserLocales = acceptLanguage
      .split(',')
      .map((part) => {
        const [locale, quality = 'q=1'] = part.trim().split(';');
        return {
          locale: locale.split('-')[0].toLowerCase(), // Get primary subtag
          quality: parseFloat(quality.replace('q=', '')),
        };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { locale } of browserLocales) {
      if (locales.includes(locale as Locale)) {
        return locale as Locale;
      }
    }
  }

  // 3. Fallback to default
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await detectLocale();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
