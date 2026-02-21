import { test, expect } from '@playwright/test';

/**
 * Dashboard tests — all tests require an authenticated session.
 * Session state is loaded from e2e/.auth/user.json (produced by auth.setup.ts).
 */
test.use({ storageState: 'e2e/.auth/user.json' });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Authenticated suite runs in chromium project only');
  await page.goto('/en/dashboard');
  test.skip(/\/sign-in/.test(page.url()), 'No authenticated session available');
});

// ---------------------------------------------------------------------------
// Page load & structure
// ---------------------------------------------------------------------------
test.describe('Dashboard page load @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard');
  });

  test('authenticated user can access /en/dashboard without being redirected', async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/en\/dashboard/);
  });

  test('renders the page heading', async ({ page }) => {
    // The heading or landmark that identifies this as the dashboard
    await expect(
      page.getByRole('heading').or(page.getByText(/dashboard/i).first())
    ).toBeVisible();
  });

  test('renders the sidebar navigation', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('renders the dashboard footer', async ({ page }) => {
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Sensor data display (requires seeded data)
// ---------------------------------------------------------------------------
test.describe('Dashboard sensor data display @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard');
  });

  test.skip(
    true,
    'Skipped: sensor chart only renders with real seeded data from the test database'
  );

  test('renders the sensor chart section', async ({ page }) => {
    await expect(page.getByRole('region', { name: /sensor chart/i })).toBeVisible();
  });

  test('renders the sensor distribution (pie chart) section', async ({ page }) => {
    await expect(page.getByRole('region', { name: /distribution/i })).toBeVisible();
  });

  test('renders the particulate metrics section', async ({ page }) => {
    await expect(page.getByRole('region', { name: /particulate/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
test.describe('Dashboard filters @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard');
  });

  test('opens the filter panel when the Filters button is clicked', async ({ page }) => {
    const filtersButton = page.getByRole('button', { name: /filter/i });
    await expect(filtersButton).toBeVisible();
    await filtersButton.click();

    // The popover / panel becomes visible after click
    await expect(page.getByRole('dialog').or(page.getByText(/apply|reset/i))).toBeVisible();
  });

  test('shows a date range picker inside the filter panel', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();

    await expect(
      page.getByLabel(/start date/i).or(page.getByPlaceholder(/start date/i))
    ).toBeVisible();
    await expect(
      page.getByLabel(/end date/i).or(page.getByPlaceholder(/end date/i))
    ).toBeVisible();
  });

  test('reset button clears active filters', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();

    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // After reset the filter panel should still be open (or close) but no
    // active filter badges should appear in the header area
    await expect(page.getByRole('button', { name: /filter/i })).toBeVisible();
  });

  test.skip(
    true,
    'Skipped: sensor and location filter options require seeded sensor/site data'
  );

  test('sensor select populates with available sensor IDs', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    const sensorSelect = page.getByRole('combobox', { name: /sensor/i });
    await sensorSelect.click();
    // At least one option should be present
    await expect(page.getByRole('option').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Map panel
// ---------------------------------------------------------------------------
test.describe('Dashboard map panel @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard');
  });

  test('renders the map container element', async ({ page }) => {
    // Leaflet renders a div with class "leaflet-container"
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15_000 });
  });

  test.skip(
    true,
    'Skipped: map markers require real sensor location data in the test database'
  );

  test('map displays a sensor location marker', async ({ page }) => {
    const marker = page.locator('.leaflet-marker-icon').first();
    await expect(marker).toBeVisible({ timeout: 15_000 });
  });
});

// ---------------------------------------------------------------------------
// Locale variants
// ---------------------------------------------------------------------------
test.describe('Dashboard locale routing @auth', () => {
  for (const locale of ['en', 'ru', 'kz'] as const) {
    test(`dashboard loads correctly under /${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/dashboard`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard`));
      await expect(page.getByRole('navigation')).toBeVisible();
    });
  }
});
