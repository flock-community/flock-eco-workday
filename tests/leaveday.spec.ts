import { expect, test } from '@playwright/test';
import {
  changeStatusOnLocator,
  findOnAnyPage,
  selectPersonInLayout,
} from './steps/dayListSteps';
import {
  Given_I_am_logged_in_as_user,
  When_I_click_the_button,
  When_I_fill_in_the_date_range_from_till,
} from './steps/workdaySteps';

// LeaveDayController exposes /api/leave-days and is exercised here via the
// LeaveDayPage UI. Today's session date is 2026-05-02 so the booking dates
// stay inside May 2026 to keep the PeriodInputField light while the helper
// sets the date range.
const RUN_ID = Date.now();
const LEAVE_DESCRIPTION = `Leaveday spec ${RUN_ID}`;
const LEAVE_FROM = '04-05-2026';
const LEAVE_TO = '08-05-2026';

test.describe.serial('LeaveDayController /api/leave-days', () => {
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

  test('Worker submits a holiday (POST /api/leave-days)', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'ernie');

    await page.goto('/leave-days');
    await page.waitForLoadState('networkidle');

    await When_I_click_the_button(page, 'Add');
    const dialog = page.getByRole('dialog');
    // The dialog header is "Leave days", which collides with the page title,
    // so anchor on the Description field that only exists inside the form.
    await expect(dialog.getByLabel('Description')).toBeVisible();

    await dialog.getByLabel('Description').fill(LEAVE_DESCRIPTION);
    await When_I_fill_in_the_date_range_from_till(page, LEAVE_FROM, LEAVE_TO);

    const leavePost = page.waitForResponse(
      (response) =>
        response.url().includes('/api/leave-days') &&
        response.request().method() === 'POST' &&
        response.status() < 400,
    );
    await When_I_click_the_button(page, 'Save');
    await leavePost;
    await expect(dialog).toBeHidden({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const leaveCards = page
      .locator('.MuiCard-root:not(:has(.MuiCard-root))')
      .filter({ hasText: LEAVE_DESCRIPTION });
    const leaveCard = await findOnAnyPage(page, leaveCards);
    await expect(leaveCard.getByRole('button', { name: 'REQUESTED' })).toBeVisible();
  });

  test('Admin filters leave days by personId and approves (GET + PUT /api/leave-days)', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, 'bert');

    await page.goto('/leave-days');
    await page.waitForLoadState('networkidle');

    // Picking ernie triggers GET /api/leave-days?personId=<ernie-uuid>.
    await selectPersonInLayout(page, 'Ernie Muppets');

    const leaveCards = page
      .locator('.MuiCard-root:not(:has(.MuiCard-root))')
      .filter({ hasText: LEAVE_DESCRIPTION });
    const leaveCard = await findOnAnyPage(page, leaveCards);
    await changeStatusOnLocator(page, leaveCard, 'REQUESTED', 'APPROVED');
  });
});
