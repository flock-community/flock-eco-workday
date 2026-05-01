import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const ADMIN_USERNAME = 'bert';
const NON_ADMIN_USERNAME = 'tommy';

test.describe('User management UI', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('admin can see the users list (exercises GET /api/users and /api/authorities)', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('table thead')).toContainText('Name');
    await expect(page.locator('table thead')).toContainText('Email');
    await expect(page.locator('table thead')).toContainText('Authorities');

    await expect(
      page.locator('table tbody tr').filter({ hasText: 'bert@sesam.straat' }),
    ).toBeVisible();
  });

  test('admin can search for a user', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search').fill('tommy');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('table tbody tr').filter({ hasText: 'tommy@sesam.straat' }),
    ).toBeVisible();
  });

  test('admin can open the create-user dialog', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create user')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  });
});

test.describe('Profile UI', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('logged-in user sees their profile (exercises GET /api/users/me and /api/users/me/accounts)', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, NON_ADMIN_USERNAME);
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Profile')).toBeVisible();
    await expect(
      page
        .locator('text=Email')
        .locator('..')
        .locator('text=tommy@sesam.straat'),
    ).toBeVisible();
    await expect(page.getByText('API Keys')).toBeVisible();
  });

  test('logged-in user can generate and revoke an API key', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, NON_ADMIN_USERNAME);
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Generate' }).click();
    await expect(page.getByText('Generate API Key')).toBeVisible();

    const label = `e2e-${Date.now()}`;
    await page.getByLabel('Label').fill(label);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Generate' })
      .click();

    await expect(page.getByText('API Key Generated')).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(
      page.locator('table tbody tr').filter({ hasText: label }),
    ).toBeVisible();

    await page
      .locator('table tbody tr')
      .filter({ hasText: label })
      .getByRole('button')
      .click();
    await expect(
      page.getByText('Are you sure you want to revoke'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(
      page.locator('table tbody tr').filter({ hasText: label }),
    ).toHaveCount(0);
  });
});
