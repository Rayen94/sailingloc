import { expect, test } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('SailingLoc').first()).toBeVisible();
});

test('navbar links work', async ({ page }) => {
  await page.goto('/');
  for (const [label, path] of [
    ['Accueil', '/'],
    ['Bateaux', '/boats'],
    ['Catégories', '/categories'],
    ['Services', '/products'],
    ['Contact', '/contact'],
  ]) {
    await page.getByRole('link', { name: label }).first().click();
    await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
  }
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
});

test('admin dashboard and users pages load in local demo mode', async ({ page }) => {
  await page.goto('/admin/dashboard?demoRole=admin');
  await expect(page.getByText(/Tableau de bord|Impossible de charger les statistiques admin/i).first()).toBeVisible();
  await page.goto('/admin/users?demoRole=admin');
  await expect(page.getByText('Utilisateurs').first()).toBeVisible();
});

test('boats listing page loads', async ({ page }) => {
  await page.goto('/boats');
  await expect(page.getByText(/bateaux/i).first()).toBeVisible();
});

test('boat detail route loads or shows a handled not found state', async ({ page }) => {
  await page.goto('/boats/000000000000000000000000');
  await expect(page.getByText(/introuvable|erreur|bateau/i).first()).toBeVisible();
});

test('owner dashboard blocks unauthenticated access', async ({ page }) => {
  await page.goto('/owner/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('admin page blocks non-admin user', async ({ page }) => {
  await page.goto('/admin/users?demoRole=tenant');
  await expect(page).toHaveURL(/\/$/);
});

test('keyboard users can skip directly to the main content', async ({ page, browserName }) => {
  await page.addInitScript(() =>
    localStorage.setItem('sailingloc_cookie_preferences', JSON.stringify({ essential: true, analytics: false }))
  );
  await page.goto('/');
  // Dans WebKit (Safari), Tab seul ne va pas sur les liens : il faut Alt+Tab (réglage par défaut de Safari).
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});
