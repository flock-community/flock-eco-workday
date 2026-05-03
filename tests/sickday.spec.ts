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

// SickdayController exposes /api/sickdays and is exercised here via the
// SickDayPage UI. Today's session date is 2026-05-02 and the booking dates
// are kept within May 2026 (a clean Mon → Fri week) so the PeriodInputField
// only renders five inputs while the helper sets the date range.
const RUN_ID = Date.now();
const SICK_DESCRIPTION = `Sickday spec ${RUN_ID}`;
const SICKDAY_FROM = '11-05-2026';
const SICKDAY_TO = '15-05-2026';

test.describe
  .serial('SickdayController /api/sickdays', () => {
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

    test('Worker submits a sick day (POST /api/sickdays)', async ({ page }) => {
      await Given_I_am_logged_in_as_user(page, 'ernie');

      await page.goto('/sickdays');
      await page.waitForLoadState('networkidle');

      // The dialog only opens after the SickDayClient.get bootstrap completes,
      // so wait for the form field that signals the dialog body is ready.
      await When_I_click_the_button(page, 'Add');
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByLabel('Description')).toBeVisible();

      await dialog.getByLabel('Description').fill(SICK_DESCRIPTION);
      await When_I_fill_in_the_date_range_from_till(
        page,
        SICKDAY_FROM,
        SICKDAY_TO,
      );

      // The POST is what closes the dialog, so disappearance is the success
      // signal. Without this wait, the next assertion races the MUI Slide
      // transition that still overlays the listing.
      const sickPost = page.waitForResponse(
        (response) =>
          response.url().includes('/api/sickdays') &&
          response.request().method() === 'POST' &&
          response.status() < 400,
      );
      await When_I_click_the_button(page, 'Save');
      await sickPost;
      await expect(dialog).toBeHidden({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // The new sick day appears in the from-desc paginated list. Walk pages
      // because seeded ernie sick days populate earlier pages.
      const sickCards = page
        .locator('.MuiCard-root:not(:has(.MuiCard-root))')
        .filter({ hasText: SICK_DESCRIPTION });
      const sickCard = await findOnAnyPage(page, sickCards);
      await expect(
        sickCard.getByRole('button', { name: 'REQUESTED' }),
      ).toBeVisible();
    });

    test('Admin filters sick days by personId and approves (GET + PUT /api/sickdays)', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');

      await page.goto('/sickdays');
      await page.waitForLoadState('networkidle');

      // Picking ernie triggers GET /api/sickdays?personId=<ernie-uuid>.
      await selectPersonInLayout(page, 'Ernie Muppets');

      const sickCards = page
        .locator('.MuiCard-root:not(:has(.MuiCard-root))')
        .filter({ hasText: SICK_DESCRIPTION });
      const sickCard = await findOnAnyPage(page, sickCards);
      await changeStatusOnLocator(page, sickCard, 'REQUESTED', 'APPROVED');
    });
  });
