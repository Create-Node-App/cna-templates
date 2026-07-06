import { test } from '@playwright/test';
import path from 'path';

const TEMPLATE = process.env.TEMPLATE || 'unknown';
const LANDING_PATH = process.env.LANDING_PATH || '/';
const OUTPUT_DIR = path.resolve(__dirname, '__screenshots__');

test.describe(`Landing page visual regression - ${TEMPLATE}`, () => {
  const filename = (suffix: string) => path.join(OUTPUT_DIR, `${TEMPLATE}-${suffix}.png`);

  test('dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
    await page.goto(LANDING_PATH);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: filename('dark'), fullPage: true });
  });

  test('light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    await page.goto(LANDING_PATH);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: filename('light'), fullPage: true });
  });

  test('reduced motion', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto(LANDING_PATH);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: filename('motion'), fullPage: true });
  });
});
