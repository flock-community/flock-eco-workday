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
  When_I_select_the_assignment,
} from './steps/workdaySteps';

// WorkdayController exposes /api/workdays. The simple submit flow already
// lives in workday.spec.ts; this spec rounds out the coverage by exercising
// the admin-side endpoints: GET /api/workdays?personId=<uuid> and
// PUT /api/workdays/{code}.
//
// Today's session date is 2026-05-02. ernie has a seeded Client D
// assignment that runs all of 2026, and seeded ernie workdays only fill the
// 1st → 10th of each month, so 18 → 22 May 2026 (Mon → Fri) is a free,
// week-aligned slot inside the current month — which keeps the
// PeriodInputField light while the helper sets the date range.
const WORKDAY_FROM = '18-05-2026';
const WORKDAY_TO = '22-05-2026';
const WORKDAY_CLIENT = 'Client D';
const WORKDAY_ROLE = 'Junior software engineer';

test.describe
  .serial('WorkdayController /api/workdays admin flow', () => {
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

    test('Worker submits a workday (POST /api/workdays)', async ({ page }) => {
      await Given_I_am_logged_in_as_user(page, 'ernie');

      await page.goto('/workdays');
      await page.waitForLoadState('networkidle');

      await When_I_click_the_button(page, 'Add');
      await expect(page.getByText('Create Workday')).toBeVisible();

      await When_I_fill_in_the_date_range_from_till(
        page,
        WORKDAY_FROM,
        WORKDAY_TO,
      );
      // Client D is the only assignment overlapping this Mon → Fri slot, but
      // the AssignmentSelector still surfaces the dropdown — pick by name to
      // avoid relying on auto-selection.
      await When_I_select_the_assignment(page, WORKDAY_CLIENT);

      const workPost = page.waitForResponse(
        (response) =>
          response.url().includes('/api/workdays') &&
          response.request().method() === 'POST' &&
          response.status() < 400,
      );
      await When_I_click_the_button(page, 'Save');
      await workPost;
      await expect(page.getByText('Create Workday')).not.toBeVisible();
      await page.waitForLoadState('networkidle');

      // The list is sorted by `from` desc, so seeded Aug → Dec 2026 entries
      // come before our 18-05-2026 booking — walk pagination to find the row.
      const workRows = page
        .locator('tr')
        .filter({ hasText: WORKDAY_FROM })
        .filter({ hasText: WORKDAY_ROLE });
      const workRow = await findOnAnyPage(page, workRows);
      await expect(workRow).toContainText(WORKDAY_CLIENT);
      await expect(
        workRow.getByRole('button', { name: 'REQUESTED' }),
      ).toBeVisible();
    });

    test('Admin filters workdays by personId and approves (GET + PUT /api/workdays)', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');

      await page.goto('/workdays');
      await page.waitForLoadState('networkidle');

      // Picking ernie triggers GET /api/workdays?personId=<ernie-uuid>.
      await selectPersonInLayout(page, 'Ernie Muppets');

      // Filter by date + role only — including the REQUESTED status in the
      // locator would invalidate it after the PUT lands and flips the row to
      // APPROVED, breaking changeStatusOnLocator's post-change assertion.
      const workRows = page
        .locator('tr')
        .filter({ hasText: WORKDAY_FROM })
        .filter({ hasText: WORKDAY_ROLE });
      const workRow = await findOnAnyPage(page, workRows);
      await changeStatusOnLocator(page, workRow, 'REQUESTED', 'APPROVED');
    });
  });
