import { test, expect } from '@playwright/test';

/**
 * Navigation tests — covers locale switching, navbar rendering, and
 * sidebar links for authenticated users.
 *
 * Unauthenticated navigation tests live here; the sidebar tests use the
 * saved auth session via storageState.
 */

// ---------------------------------------------------------------------------
// Locale switcher
// ---------------------------------------------------------------------------
test.describe('Language / locale switcher', () => {
  test('switches from English to Russian via the language selector', async ({ page }) => {
    await page.goto('/en');

    // Click the locale select (combobox)
    await page.getByRole('combobox', { name: /language|locale/i }).click();
    await page.getByRole('option', { name: /русский/i }).click();

    await expect(page).toHaveURL(/\/ru/, { timeout: 10_000 });
  });

  test('switches from English to Kazakh via the language selector', async ({ page }) => {
    await page.goto('/en');

    await page.getByRole('combobox', { name: /language|locale/i }).click();
    await page.getByRole('option', { name: /қазақша/i }).click();

    await expect(page).toHaveURL(/\/kz/, { timeout: 10_000 });
  });

  test('navigating to /ru preserves the page in Russian', async ({ page }) => {
    await page.goto('/ru');
    await expect(page).toHaveURL(/\/ru/);
    // Locale prefix must remain after page load
    await expect(page.url()).toContain('/ru');
  });
});

// ---------------------------------------------------------------------------
// Navbar — public (unauthenticated)
// ---------------------------------------------------------------------------
test.describe('Navbar — unauthenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('renders the TynysAI logo / brand link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /tynys/i }).first()).toBeVisible();
  });

  test('shows the dark-mode toggle button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /dark mode|toggle theme|light|dark/i })
    ).toBeVisible();
  });

  test('dark-mode toggle switches the document theme', async ({ page }) => {
    const html = page.locator('html');
    const before = await html.getAttribute('class');

    await page.getByRole('button', { name: /dark mode|toggle theme|light|dark/i }).click();

    const after = await html.getAttribute('class');
    expect(after).not.toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// Dashboard sidebar — authenticated
// ---------------------------------------------------------------------------
test.describe('Dashboard sidebar — authenticated', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard');
  });

  test('shows the Dashboard navigation link in the sidebar', async ({ page }) => {
    await expect(page.getByRole('link', { name: /^dashboard$/i })).toBeVisible();
  });

  test('shows the Analytics navigation link in the sidebar', async ({ page }) => {
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
  });

  test('clicking Analytics in the sidebar navigates to /en/dashboard/analytics', async ({
    page,
  }) => {
    await page.getByRole('link', { name: /analytics/i }).click();
    await expect(page).toHaveURL(/\/en\/dashboard\/analytics/);
  });

  test('shows the Sign Out button in the sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('sidebar shows the authenticated user email', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL ?? '';
    test.skip(!email, 'E2E_USER_EMAIL not set');
    await expect(page.getByText(email)).toBeVisible();
  });
});
