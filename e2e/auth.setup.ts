import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

/**
 * Runs once before authenticated test projects.
 * Logs in with credentials from env vars and persists the session
 * (cookies + localStorage) to e2e/.auth/user.json so every other
 * test project can reuse it without repeating the login flow.
 */
setup('authenticate and save session state', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL and E2E_USER_PASSWORD must be set before running E2E tests.'
    );
  }

  await page.goto('/en/sign-in');

  // Fill in credentials
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait until the dashboard is fully loaded — confirms auth succeeded
  await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole('navigation')).toBeVisible();

  // Persist credentials for dependent test projects
  await page.context().storageState({ path: authFile });
});
