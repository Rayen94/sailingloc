import { expect, test } from '@playwright/test';

// Google Tag Manager ne doit être chargé qu'après l'accord de l'utilisateur (RGPD).
const GTM_SCRIPT = 'script#sailingloc-gtm';

test.beforeEach(async ({ page }) => {
  // On bloque l'appel réel à Google : le test vérifie seulement si le site essaie de charger GTM.
  await page.route('https://www.googletagmanager.com/**', (route) => route.abort());
});

test('Google Tag Manager is not loaded before consent or after refusal', async ({ page }) => {
  const gtmRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('googletagmanager.com')) gtmRequests.push(request.url());
  });

  await page.goto('/');
  const banner = page.getByRole('dialog', { name: 'Préférences cookies' });
  await expect(banner).toBeVisible();
  await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);

  await banner.getByRole('button', { name: 'Refuser' }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);
  expect(gtmRequests).toEqual([]);
});

test('Google Tag Manager is loaded after consent and remembered', async ({ page }) => {
  await page.goto('/');
  const banner = page.getByRole('dialog', { name: 'Préférences cookies' });
  await banner.getByRole('button', { name: 'Accepter' }).click();
  await expect(page.locator(GTM_SCRIPT)).toHaveCount(1);

  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Préférences cookies' })).toBeHidden();
  await expect(page.locator(GTM_SCRIPT)).toHaveCount(1);
});
