// @ts-expect-error -- @playwright/test types; install playwright separately with npx playwright install
import { test, expect } from '@playwright/test';

test.describe('App smoke test', () => {
  test('home page loads with a visible heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
