import { test, expect } from '@playwright/test';

// Walks the order flow up to the last step. It never submits: this suite runs against the live
// backend, and a submitted order would land in the team's inbox.
test('order flow: product, delivery and contact steps', async ({ page }) => {
  await page.goto('/pedido/reformer-clasico-maple-pl001?cantidad=4');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu pedido');
  await expect(page.getByRole('radio', { name: /Pack 4/ })).toBeChecked();
  await page.getByRole('button', { name: /Continuar con la entrega/ }).click();

  // Continuing with an empty address lists what is missing and stays on the step.
  await expect(page).toHaveURL(/paso=2/);
  await page.getByRole('button', { name: /^Continuar/ }).click();
  await expect(page.locator('#pedido-entrega [role=alert]')).toHaveCount(3);

  // A pasted postal code with extra text is reduced to its digits and names the state.
  await page.getByLabel('Código postal').fill('C.P. 44100');
  await expect(page.getByLabel('Código postal')).toHaveValue('44100');
  await expect(page.getByText('Enviamos a Jalisco.')).toBeVisible();
  await page.getByLabel('Ciudad o municipio').fill('Guadalajara');
  await page.getByLabel('Calle y número').fill('Av. Vallarta 1000');
  await expect(page.locator('#pedido-entrega [role=alert]')).toHaveCount(0);
  await page.getByRole('button', { name: /^Continuar/ }).click();

  await expect(page).toHaveURL(/paso=3/);
  await expect(page.getByRole('button', { name: /Enviar pedido/ })).toBeVisible();

  // The browser's back button returns to the previous step with the address kept.
  await page.goBack();
  await expect(page.getByLabel('Calle y número')).toHaveValue('Av. Vallarta 1000');
});

test('order flow: an unknown product goes to the shop', async ({ page }) => {
  await page.goto('/pedido/no-existe');
  await expect(page).toHaveURL(/\/shop$/);
});
