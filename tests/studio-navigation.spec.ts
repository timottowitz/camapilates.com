import { test, expect } from '@playwright/test';

test.describe('Studios navigation', () => {
  test('City directory -> studio detail loads', async ({ page }) => {
    await page.goto('/estudios-de-pilates/ciudad-de-mexico');

    // Ensure list renders
    await expect(page.getByText(/estudios encontrados/i)).toBeVisible();

    const firstDetailLink = page.getByRole('link', { name: 'Ver Detalles' }).first();
    await expect(firstDetailLink).toBeVisible();
    await firstDetailLink.click();

    // Expect navigation to detail route with normalized slug
    await page.waitForURL(/\/estudios-de-pilates\/ciudad-de-mexico\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Studio Not Found')).not.toBeVisible();
  });

  test('Accent slug normalizes and page loads', async ({ page }) => {
    await page.goto('/estudios-de-pilates/ciudad-de-méxico');

    // After normalization, URL should switch to ASCII slug but content remains
    await page.waitForURL(/\/estudios-de-pilates\/ciudad-de-mexico$/);
    await expect(page.getByText(/estudios encontrados/i)).toBeVisible();
  });
});
