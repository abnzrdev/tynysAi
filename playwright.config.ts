import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for TynysAI.
 * Auth state is set up once via the 'auth' project and reused
 * by all projects that declare it as a dependency.
 *
 * Required environment variables:
 *   BASE_URL          — app origin, defaults to http://localhost:3000
 *   E2E_USER_EMAIL    — test account email
 *   E2E_USER_PASSWORD — test account password
 *   IOT_DEVICE_SECRET — bearer token for sensor-data API tests
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── Step 1: create and persist the authenticated session ──────────────
    {
      name: 'auth',
      testMatch: '**/auth.setup.ts',
    },

    // ── Step 2: run feature tests in Chromium using the saved session ─────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['auth'],
    },

    // ── Unauthenticated tests (no dependency on auth project) ─────────────
    {
      name: 'unauthenticated',
      testMatch: ['**/auth.spec.ts', '**/home.spec.ts', '**/navigation.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },

    // ── API-level tests run headlessly without a browser session ──────────
    {
      name: 'api',
      testMatch: '**/api.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
