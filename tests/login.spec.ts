import { expect, test } from '@playwright/test';

// Test configuration
const LOGIN_URL = 'http://localhost:3000/auth';
const BASE_URL = 'http://localhost:3000';
const VALID_USERNAME = 'tommy@sesam.straat'; // Real credentials from readme.md
const VALID_PASSWORD = 'tommy';
const INVALID_USERNAME = 'invalid@example.com';
const INVALID_PASSWORD = 'wrongpassword';

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies first
    await context.clearCookies();

    // Navigate directly to the login page
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });

    // Clear storage after navigation
    await page.evaluate(() => {
      if (typeof window.localStorage !== 'undefined')
        window.localStorage.clear();
      if (typeof window.sessionStorage !== 'undefined')
        window.sessionStorage.clear();
    });

    // Wait for page to fully load and verify we're on the login page
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Workday Login")')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Enter valid username from readme.md
    await page.fill('input[name="username"]', VALID_USERNAME);

    // Enter valid password from readme.md
    await page.fill('input[name="password"]', VALID_PASSWORD);

    // Click login button
    await page.click('button:has-text("Sign in")');

    // Verify successful login - check for redirect to main dashboard
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // Verify dashboard elements are present
    await expect(page.locator('h2:has-text("Hi, Tommy!")')).toBeVisible();
    await expect(page.locator('a:has-text("Flock. Workday")')).toBeVisible();
  });

  test('should stay on login page with invalid credentials', async ({
    page,
  }) => {
    // This app appears to stay on login page when credentials are entered
    // Enter invalid username
    await page.fill('input[name="username"]', INVALID_USERNAME);

    // Enter invalid password
    await page.fill('input[name="password"]', INVALID_PASSWORD);

    // Click login button
    await page.click('button:has-text("Sign in")');

    // Verify we stay on the login page (no redirect)
    await expect(page).toHaveURL(LOGIN_URL);
    await expect(page.locator('h1:has-text("Workday Login")')).toBeVisible();
  });

  test('should verify page elements are present', async ({ page }) => {
    // Verify login page elements are visible
    await expect(page.locator('h1:has-text("Workday Login")')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    await expect(
      page.locator('p:has-text("Flock Software Engineering B.V. 2025")'),
    ).toBeVisible();

    // Verify input fields are enabled
    await expect(page.locator('input[name="username"]')).toBeEnabled();
    await expect(page.locator('input[name="password"]')).toBeEnabled();
    await expect(page.locator('button:has-text("Sign in")')).toBeEnabled();
  });

  test('should hide password input', async ({ page }) => {
    // Verify password field is of type password
    await expect(page.locator('input[name="password"]')).toHaveAttribute(
      'type',
      'password',
    );

    // Enter password and verify it's hidden
    await page.fill('input[name="password"]', VALID_PASSWORD);
    const passwordValue = await page.inputValue('input[name="password"]');
    expect(passwordValue).toBe(VALID_PASSWORD);

    // Verify password is visually hidden (dots/asterisks)
    const passwordType = await page.getAttribute(
      'input[name="password"]',
      'type',
    );
    expect(passwordType).toBe('password');
  });

  test('should allow login with Enter key', async ({ page }) => {
    // Enter credentials
    await page.fill('input[name="username"]', VALID_USERNAME);
    await page.fill('input[name="password"]', VALID_PASSWORD);

    // Press Enter on password field
    await page.press('input[name="password"]', 'Enter');

    // Verify successful login
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.locator('h2:has-text("Hi, Tommy!")')).toBeVisible();
  });

  test('should show user menu with Profile and Logout options', async ({
    page,
  }) => {
    // Login first with valid credentials
    await page.fill('input[name="username"]', VALID_USERNAME);
    await page.fill('input[name="password"]', VALID_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(`${BASE_URL}/`);

    // Click user menu button using the correct selector
    await page.click('button[aria-haspopup="true"]');

    // Wait for menu to appear and verify menu items are present
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();

    // Verify Profile is disabled
    await expect(
      page.getByRole('menuitem', { name: 'Profile' }),
    ).toBeDisabled();

    // Verify Logout is enabled
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeEnabled();
  });
});

// Additional test for logout functionality
test.describe('Logout Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies first
    await context.clearCookies();

    // Login before each logout test
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });

    // Clear storage after navigation
    await page.evaluate(() => {
      if (typeof window.localStorage !== 'undefined')
        window.localStorage.clear();
      if (typeof window.sessionStorage !== 'undefined')
        window.sessionStorage.clear();
    });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Login with valid credentials
    await page.fill('input[name="username"]', VALID_USERNAME);
    await page.fill('input[name="password"]', VALID_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('should logout successfully', async ({ page }) => {
    // Verify we're logged in and on the dashboard
    await expect(page.locator('h2:has-text("Hi, Tommy!")')).toBeVisible();

    // Click user menu button using the correct selector
    await page.click('button[aria-haspopup="true"]');

    // Wait for menu to appear and click logout
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();

    // Click logout and wait for navigation
    await page.click('li[role="menuitem"]:has-text("Logout")');

    // Wait for redirect to login page (with longer timeout)
    await page.waitForURL(/.*\/auth/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("Workday Login")')).toBeVisible();

    // Verify user cannot access dashboard without logging in again
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(/.*\/auth/);
  });
});

// Test hooks for setup and cleanup
test.afterEach(async ({ page, context }) => {
  // Clean up after each test to ensure isolation
  await context.clearCookies();
  await page.evaluate(() => {
    if (typeof window.localStorage !== 'undefined') window.localStorage.clear();
    if (typeof window.sessionStorage !== 'undefined')
      window.sessionStorage.clear();
  });
});
