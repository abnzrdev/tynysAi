import { test, expect } from '@playwright/test';

/**
 * Public home-page tests — no authentication required.
 * Tests cover the marketing / landing page at /en, /ru, and /kz.
 */
test.describe('Public home page', () => {
  test('loads the English landing page and shows localised content', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en/);
    // The page title should reference the product
    await expect(page).toHaveTitle(/Tynys/i);
  });

  test('loads the Russian landing page at /ru', async ({ page }) => {
    await page.goto('/ru');
    await expect(page).toHaveURL(/\/ru/);
    await expect(page).toHaveTitle(/Tynys/i);
  });

  test('loads the Kazakh landing page at /kz', async ({ page }) => {
    await page.goto('/kz');
    await expect(page).toHaveURL(/\/kz/);
    await expect(page).toHaveTitle(/Tynys/i);
  });

  test('shows navigation links for unauthenticated users (Login and Sign Up)', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(page.getByRole('link', { name: /sign in|login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up|register/i })).toBeVisible();
  });

  test('clicking Sign In in the navbar navigates to /en/sign-in', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/en\/sign-in/);
  });

  test('clicking Sign Up in the navbar navigates to /en/sign-up', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /sign up|register/i }).click();
    await expect(page).toHaveURL(/\/en\/sign-up/);
  });

  test('root path / redirects to a localised page', async ({ page }) => {
    await page.goto('/');
    // Should resolve to one of the three locale prefixes
    await expect(page).toHaveURL(/\/(en|ru|kz)/);
  });
});
