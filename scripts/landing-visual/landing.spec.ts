import { test, expect } from '@playwright/test';

const TEMPLATE = process.env.TEMPLATE || 'unknown';

test.describe(`Landing page visual regression - ${TEMPLATE}`, () => {
  test('dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${TEMPLATE}-dark.png`, { fullPage: true });
  });

  test('light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${TEMPLATE}-light.png`, { fullPage: true });
  });

  test('reduced motion', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${TEMPLATE}-motion.png`, { fullPage: true });
  });
});
