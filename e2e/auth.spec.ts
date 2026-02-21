import { test, expect, type Page } from '@playwright/test';

const hasAuthCredentials = Boolean(process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD);

// ---------------------------------------------------------------------------
// Helper — fills and submits the sign-in form
// ---------------------------------------------------------------------------
async function fillSignInForm(
  page: Page,
  email: string,
  password: string
) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

// ---------------------------------------------------------------------------
// Sign-In
// ---------------------------------------------------------------------------
test.describe('Sign-In page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/sign-in');
  });

  test('renders email and password fields with a Sign In button', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows a link to the sign-up page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /create an account/i })).toBeVisible();
  });

  test('shows an error alert when credentials are invalid', async ({ page }) => {
    await fillSignInForm(page, 'wrong@example.com', 'badpassword');

    await expect(page.getByRole('alert')).toBeVisible();
    // Alert must contain a human-readable error, not a raw JSON message
    await expect(page.getByRole('alert')).not.toContainText('undefined');
  });

  test('redirects to the dashboard after a successful sign-in', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL ?? '';
    const password = process.env.E2E_USER_PASSWORD ?? '';

    test.skip(!email || !password, 'E2E_USER_EMAIL / E2E_USER_PASSWORD not set');

    await fillSignInForm(page, email, password);

    await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 15_000 });
  });

  test('shows loading state on button while sign-in request is in flight', async ({ page }) => {
    await page.getByLabel('Email').fill('slow@example.com');
    await page.getByLabel('Password').fill('password123');

    // Intercept the NextAuth signIn request so it stays pending long enough
    // for us to assert the loading state
    await page.route('**/api/auth/callback/credentials**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.getByRole('button', { name: /sign in/i }).click();

    // During the pending request the button should be disabled or show a
    // different label (spinner, "Signing in…", etc.)
    const btn = page.getByRole('button', { name: /sign in|signing in/i });
    await expect(btn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Sign-Up
// ---------------------------------------------------------------------------
test.describe('Sign-Up page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/sign-up');
  });

  test('renders all registration fields', async ({ page }) => {
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
  });

  test('shows a link back to the sign-in page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('shows a validation error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('SecurePass1!');
    await page.getByLabel('Confirm Password').fill('DifferentPass1!');
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('shows a validation error when the password is shorter than 8 characters', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('short@example.com');
    await page.getByLabel('Password').fill('abc');
    await page.getByLabel('Confirm Password').fill('abc');
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('shows a success message after a valid registration', async ({ page }) => {
    // Use a unique email so the account does not already exist
    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await page.getByLabel('Full Name').fill('E2E Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('SecureE2E1!');
    await page.getByLabel('Confirm Password').fill('SecureE2E1!');
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    // Success state: alert or redirect to sign-in
    await expect(
      page.getByRole('alert').or(page.getByText(/account created|check your email/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows an error when registering with an already-used email', async ({ page, request }) => {
    const existingEmail = `e2e-ui-duplicate-${Date.now()}@example.com`;

    const seedResponse = await request.post('/api/auth/signup', {
      data: { name: 'Existing User', email: existingEmail, password: 'SecureE2E1!' },
    });
    expect(seedResponse.status()).toBe(201);

    await page.getByLabel('Full Name').fill('Duplicate User');
    await page.getByLabel('Email').fill(existingEmail);
    await page.getByLabel('Password').fill('SecureE2E1!');
    await page.getByLabel('Confirm Password').fill('SecureE2E1!');
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Sign-Out  (requires an active session — run under 'chromium' project)
// ---------------------------------------------------------------------------
test.describe('Sign-Out', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('signs the user out and redirects to the sign-in page', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'unauthenticated' || !hasAuthCredentials,
      'Requires authenticated project and credentials'
    );

    await page.goto('/en/dashboard');

    // Open the user avatar / dropdown menu and click Sign Out
    await page.getByRole('button', { name: /user menu|account|avatar/i }).click();
    await page.getByRole('menuitem', { name: /sign out/i }).click();

    // After sign-out the user is redirected away from the dashboard
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Route Protection
// ---------------------------------------------------------------------------
test.describe('Route protection', () => {
  test('unauthenticated user is redirected to sign-in when visiting /en/dashboard', async ({
    page,
  }) => {
    await page.goto('/en/dashboard');
    // Should land on the sign-in page (or home), never on the dashboard
    await expect(page).not.toHaveURL(/\/dashboard/);
    await expect(page).toHaveURL(/sign-in|\/en\/?$/);
  });
});
