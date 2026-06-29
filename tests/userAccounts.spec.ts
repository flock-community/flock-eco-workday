import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

// Exercises the admin-only user-account management added to the user edit
// dialog: an admin opens a user, sees that user's linked login accounts and
// deletes one. The backend gates DELETE /api/user-accounts/{id} on
// UserAuthority.WRITE, which the seeded admin (bert) holds.
//
// A throwaway user is registered per run so the test never deletes a seeded
// user's login account — other specs log in as those users.
test.describe('User account management', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test.afterEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => {
      if (typeof window.localStorage !== 'undefined')
        window.localStorage.clear();
      if (typeof window.sessionStorage !== 'undefined')
        window.sessionStorage.clear();
    });
  });

  test('admin can view and delete a user account', async ({ page }) => {
    const unique = `e2eaccdel${Date.now()}`;
    const email = `${unique}@example.com`;

    // bert is seeded as ADMIN and therefore holds UserAuthority.WRITE.
    await Given_I_am_logged_in_as_user(page, 'bert');

    // Seed a throwaway user with a password account. page.request shares the
    // logged-in session cookie and CSRF is disabled on the server.
    const res = await page.request.post('/api/users/register', {
      data: { email, name: unique, password: 'secret123', authorities: [] },
    });
    expect(res.ok()).toBeTruthy();

    // Locate the new user in the list.
    await page.goto('/users');
    await page.getByPlaceholder('Search name').fill(unique);

    const row = page.locator('table tbody tr', { hasText: unique });
    await expect(row).toBeVisible();
    await row.click();

    // The edit dialog lists the user's linked accounts.
    const userDialog = page
      .getByRole('dialog')
      .filter({ hasText: 'Create user' });
    await expect(userDialog.getByText('Accounts')).toBeVisible();
    await expect(
      userDialog.getByText('Password', { exact: true }),
    ).toBeVisible();

    // Delete the password account and confirm.
    await userDialog.getByRole('button', { name: 'delete account' }).click();
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();

    // The account is removed.
    await expect(userDialog.getByText('No accounts')).toBeVisible();
    await expect(userDialog.getByText('Password', { exact: true })).toHaveCount(
      0,
    );
  });
});
