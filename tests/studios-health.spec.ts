import { test, expect } from '@playwright/test';

const routes = [
  '/estudios-de-pilates',
  '/estudios-de-pilates/ciudad-de-mexico',
  '/estudios-de-pilates/ciudad-de-mexico/hava-reformer-pilates',
];

test.describe('Studios pages load without runtime errors', () => {
  for (const path of routes) {
    test(`no page errors on ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});
