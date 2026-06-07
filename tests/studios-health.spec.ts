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
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.text().includes('Failed to load resource: the server responded with a status of 404')) return;
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('requestfailed', (request) => {
        if (request.url().includes('google-analytics.com/g/collect')) return;
        failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`);
      });
      const response = await page.goto(path, { waitUntil: 'networkidle' });
      const bodyText = await page.locator('body').textContent().catch(() => '');
      expect(
        {
          status: response?.status(),
          url: page.url(),
          bodyText: bodyText?.slice(0, 500),
          errors,
          consoleErrors,
          failedRequests,
        },
        `route diagnostics for ${path}`
      ).toMatchObject({
        status: expect.any(Number),
        errors: [],
        consoleErrors: [],
        failedRequests: [],
      });
      expect(errors).toEqual([]);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
