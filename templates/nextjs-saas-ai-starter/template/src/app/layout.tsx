import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { AuthProvider, ThemeProvider } from '@/shared/components/providers';
import { Toaster } from '@/shared/components/ui/sonner';

/**
 * DM Sans — geometric, friendly, modern sans-serif.
 * Chosen over Inter (overused in AI-generated UIs) and Open Sans (less distinctive).
 * Same font for body and headings; differentiation via weight and letter-spacing.
 * See docs/DESIGN_SYSTEM.md Section 4: Typography.
 */
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Next.js SaaS AI Template | AI-Native Skills Management',
  description: 'Production-ready Next.js SaaS boilerplate with multi-tenancy, AI assistant, and integrations',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let locale = 'en';
  let messages: Record<string, unknown> = {};
  try {
    locale = await getLocale();
    messages = await getMessages();
  } catch {
    // Fallback for build-time routes that don't have request context.
    messages = (await import('@/i18n/messages/en.json')).default as Record<string, unknown>;
  }

  return (
    <html lang={locale} suppressHydrationWarning className={`${dmSans.variable} dark:scroll-smooth`}>
      <body className={`${dmSans.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <AuthProvider>
              <main className="relative flex min-h-screen flex-col">{children}</main>
              <Toaster richColors closeButton position="bottom-right" />
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
