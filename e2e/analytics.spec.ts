import { test, expect } from '@playwright/test';

/**
 * Analytics page tests — authenticated session required.
 */
test.use({ storageState: 'e2e/.auth/user.json' });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Authenticated suite runs in chromium project only');
  await page.goto('/en/dashboard/analytics');
  test.skip(/\/sign-in/.test(page.url()), 'No authenticated session available');
});

// ---------------------------------------------------------------------------
// Page load & structure
// ---------------------------------------------------------------------------
test.describe('Analytics page load @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard/analytics');
  });

  test('authenticated user can reach /en/dashboard/analytics', async ({ page }) => {
    await expect(page).toHaveURL(/\/en\/dashboard\/analytics/);
  });

  test('renders a recognisable page heading or title', async ({ page }) => {
    await expect(
      page.getByRole('heading').or(page.getByText(/analytics/i).first())
    ).toBeVisible();
  });

  test('renders the sidebar so users can navigate away', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('Back / Dashboard link navigates to the main dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /^dashboard$/i }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });
});

// ---------------------------------------------------------------------------
// Analytics charts (require seeded sensor readings)
// ---------------------------------------------------------------------------
test.describe('Analytics charts @auth', () => {
  test.skip(
    true,
    'Skipped: charts require real sensor readings in the test database (up to 1000 rows)'
  );

  test('renders the PM2.5 trend chart', async ({ page }) => {
    await page.goto('/en/dashboard/analytics');
    await expect(page.getByRole('region', { name: /pm2\.?5/i })).toBeVisible();
  });

  test('renders the CO2 trend chart', async ({ page }) => {
    await page.goto('/en/dashboard/analytics');
    await expect(page.getByRole('region', { name: /co2/i })).toBeVisible();
  });

  test('renders the temperature / humidity chart', async ({ page }) => {
    await page.goto('/en/dashboard/analytics');
    await expect(
      page.getByRole('region', { name: /temp|humidity/i })
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Locale variants
// ---------------------------------------------------------------------------
test.describe('Analytics locale routing @auth', () => {
  for (const locale of ['en', 'ru', 'kz'] as const) {
    test(`analytics page loads under /${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/dashboard/analytics`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard/analytics`));
    });
  }
});

// ---------------------------------------------------------------------------
// PDF Export (UI affordance only)
// ---------------------------------------------------------------------------
test.describe('Analytics export @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard/analytics');
  });

  test.skip(
    true,
    'Skipped: PDF export button visibility depends on whether data is loaded'
  );

  test('Export to PDF button is visible when data is loaded', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export|pdf/i })).toBeVisible();
  });
});
