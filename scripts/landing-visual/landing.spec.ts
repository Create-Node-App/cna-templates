import { test } from '@playwright/test';
import path from 'path';

const OUTPUT_DIR = path.resolve(__dirname, '__screenshots__');

const TEMPLATES = [
  { name: 'react-vite-starter', port: 5173, command: 'npm run dev' },
  { name: 'nextjs-starter', port: 3000, command: 'npm run dev' },
  { name: 'remix-starter', port: 5173, command: 'npm run dev' },
  { name: 'astro-starter', port: 4321, command: 'npm run dev' },
  { name: 'webextension-react-vite-starter', port: 5173, command: 'npm run dev' },
];

test.describe('Landing page visual regression', () => {
  for (const template of TEMPLATES) {
    test.describe(template.name, () => {
      const filename = (suffix: string) => path.join(OUTPUT_DIR, `${template.name}-${suffix}.png`);

      test('dark mode', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: filename('dark'), fullPage: true });
      });

      test('light mode', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: filename('light'), fullPage: true });
      });

      test('reduced motion', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: filename('motion'), fullPage: true });
      });
    });
  }
});
