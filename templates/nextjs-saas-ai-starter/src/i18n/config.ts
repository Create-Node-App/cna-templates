// Internationalization configuration
// Using next-intl with cookie-based locale detection (not URL-based)
// This preserves the existing tenant routing structure

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

// Cookie name for storing user's locale preference
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
