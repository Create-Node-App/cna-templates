import { test, expect } from '@playwright/test';

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
      test('dark mode', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot(`${template.name}-dark.png`);
      });

      test('light mode', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot(`${template.name}-light.png`);
      });

      test('reduced motion', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot(`${template.name}-motion.png`);
      });
    });
  }
});
