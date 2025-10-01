import { test, expect } from '@playwright/test';

test.describe('Studios navigation', () => {
  test('City directory -> studio detail loads', async ({ page }) => {
    await page.goto('/estudios-de-pilates/ciudad-de-mexico');

    // Ensure list renders
    await expect(page.getByText(/estudios encontrados/i)).toBeVisible();

    // Click the first visible "Ver Detalles" within the first card containing a known studio name
    const firstCard = page.getByText('Equilibrium Pilates').first();
    await expect(firstCard).toBeVisible();
    await page.getByRole('link', { name: 'Ver Detalles' }).first().click();

    // Expect navigation to detail route with normalized slug
    await page.waitForURL(/\/estudios-de-pilates\/ciudad-de-mexico\//);
    await expect(page.getByRole('heading', { level: 1, name: /Equilibrium Pilates/i })).toBeVisible();
  });

  test('Accent slug normalizes and page loads', async ({ page }) => {
    await page.goto('/estudios-de-pilates/ciudad-de-méxico');

    // After normalization, URL should switch to ASCII slug but content remains
    await page.waitForURL(/\/estudios-de-pilates\/ciudad-de-mexico$/);
    await expect(page.getByText(/estudios encontrados/i)).toBeVisible();
  });
});

