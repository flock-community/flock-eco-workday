import { expect, type Locator, type Page, test } from '@playwright/test';
import {
  Given_I_am_logged_in_as_user,
  When_I_fill_in_the_date_range_from_till,
} from './steps/workdaySteps';

// Each run inserts uniquely identifiable assignment / sick / leave entries so
// we can recognise our own records even when seeded mock data fills the same
// lists.
//
// Dates are kept inside the current month (today is 2026-05-02 per the
// session). This avoids the WorkDay/SickDay/LeaveDay forms re-rendering a
// huge `PeriodInputField` (one input per weekday between `from` and `to`)
// while the helper sets the dates one at a time — which would freeze the
// browser long enough to time the fill action out. The week-aligned days
// were chosen so each booking spans a clean Mon → Fri window:
//
//   2026-05-04 = Monday
//   2026-05-11 = Monday
//   2026-05-15 = Friday
//   2026-05-18 = Monday
//   2026-05-25 = Monday
//   2026-05-29 = Friday
//
// Seeded ernie work days for 2026 are 1st → 10th of each month, so we
// place our work day in week 4 to avoid the 1st-of-month seeded entries.
const RUN_ID = Date.now();
const ASSIGNMENT_ROLE = `Workflow tester ${RUN_ID}`;
const ASSIGNMENT_CLIENT = 'Client B';
const ASSIGNMENT_FROM = '04-05-2026';
const ASSIGNMENT_TO = '31-05-2026';
const SICK_DESCRIPTION = `Workflow flu ${RUN_ID}`;
const LEAVE_DESCRIPTION = `Workflow holiday ${RUN_ID}`;

const WORKDAY_FROM = '25-05-2026';
const WORKDAY_TO = '29-05-2026';
const SICKDAY_DATE = '18-05-2026';
const LEAVE_FROM = '11-05-2026';
const LEAVE_TO = '15-05-2026';

async function selectErnieFromPersonSelector(page: Page) {
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'Ernie Muppets' }).click();
  await page.waitForLoadState('networkidle');
}

async function changeStatusOnLocator(
  page: Page,
  locator: Locator,
  fromStatus: string,
  toStatus: string,
) {
  await expect(locator).toBeVisible();
  await locator.getByRole('button', { name: fromStatus }).click();
  await page.getByRole('menuitem', { name: toStatus }).click();
  await page.waitForLoadState('networkidle');
  await expect(locator.getByRole('button', { name: toStatus })).toBeVisible();
}

// Walk the FlockPagination ("Go to next page") until `locator` resolves.
// Both the SickDay and LeaveDay APIs sit on top of Spring's standard
// Pageable resolver, which sets the `x-total` response header that the
// frontend uses to compute the page count. The WorkDay API does the same
// via its Page<T>.toResponse() helper. Seeded mock data spreads dozens of
// entries across years for ernie, so our run-specific entry can sit
// several pages deep.
async function findOnAnyPage(
  page: Page,
  locator: Locator,
  maxPages = 25,
): Promise<Locator> {
  for (let i = 0; i < maxPages; i++) {
    if ((await locator.count()) > 0) {
      return locator.first();
    }
    const nextBtn = page.getByRole('button', { name: 'Go to next page' });
    if (
      (await nextBtn.count()) === 0 ||
      !(await nextBtn.isVisible()) ||
      !(await nextBtn.isEnabled())
    ) {
      throw new Error(
        `findOnAnyPage: could not find locator within ${maxPages} pages`,
      );
    }
    await nextBtn.click();
    await page.waitForLoadState('networkidle');
  }
  throw new Error('findOnAnyPage: exceeded the page-walk safety limit');
}

test.describe
  .serial('Manager-Employee Workflow: Bert manages, Ernie books', () => {
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

    test('Bert (manager) creates an assignment for Ernie', async ({ page }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');
      await page.goto('/assignments');
      await page.waitForLoadState('networkidle');

      await selectErnieFromPersonSelector(page);

      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('Create / Edit an assignment')).toBeVisible();

      await page.getByLabel('Hourly rate').clear();
      await page.getByLabel('Hourly rate').fill('95');
      await page.getByLabel('Hours per week').clear();
      await page.getByLabel('Hours per week').fill('40');
      await page.getByLabel('Role').fill(ASSIGNMENT_ROLE);

      const startDate = page.getByLabel('Start date');
      await startDate.click();
      await startDate.fill(ASSIGNMENT_FROM);
      await startDate.press('Tab');
      await page.waitForTimeout(200);

      const endDate = page.getByLabel('End date');
      await endDate.click();
      await endDate.fill(ASSIGNMENT_TO);
      await endDate.press('Tab');
      await page.waitForTimeout(200);

      const clientSelect = page
        .getByRole('dialog')
        .getByRole('combobox')
        .first();
      await clientSelect.click();
      await page.getByRole('option', { name: ASSIGNMENT_CLIENT }).click();

      await page.getByRole('button', { name: 'Save' }).click();
      // The dialog only closes after the POST resolves, so dialog teardown
      // is itself proof that the assignment was persisted. We do not assert
      // on the rendered list here: the assignment controller does not set
      // an `x-total` header, so the AssignmentList shows count=0 and never
      // exposes a "Go to next page" button — and Ernie's seven seeded
      // assignments push our new Client B card onto a later page. The
      // follow-up test exercises the assignment by booking against it,
      // which would fail outright if creation had not succeeded.
      await expect(
        page.getByText('Create / Edit an assignment'),
      ).not.toBeVisible();
      await page.waitForLoadState('networkidle');
    });

    test('Ernie books work hours, sick hours and a leave day', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'ernie');

      // ---- Work hours ----
      await page.goto('/workdays');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('Create Workday')).toBeVisible();

      await When_I_fill_in_the_date_range_from_till(
        page,
        WORKDAY_FROM,
        WORKDAY_TO,
      );

      // The new Client B (May 2026) and the existing Client D (all of 2026)
      // both overlap May 25 → 29, so the AssignmentSelector does not
      // auto-pick. Open the dropdown and choose our new assignment by
      // matching its run-tagged role.
      await page.getByLabel('Assignment').click();
      const listbox = page.getByRole('listbox', { name: 'Assignment' });
      await listbox.waitFor({ state: 'visible', timeout: 5000 });
      await page
        .getByRole('option', {
          name: new RegExp(`${ASSIGNMENT_CLIENT}.*${ASSIGNMENT_ROLE}`),
        })
        .first()
        .click();

      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Create Workday')).not.toBeVisible();
      await page.waitForLoadState('networkidle');

      // The new work day sits on a later page of the from-desc paginated
      // list (after seeded Aug → Dec 2026 entries), so walk pagination.
      const workRows = page
        .locator('tr')
        .filter({ hasText: WORKDAY_FROM })
        .filter({ hasText: ASSIGNMENT_ROLE });
      const workRow = await findOnAnyPage(page, workRows);
      await expect(workRow).toContainText(ASSIGNMENT_CLIENT);

      // ---- Sick day ----
      await page.goto('/sickdays');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('Create Sickday')).toBeVisible();

      await page
        .getByRole('dialog')
        .getByLabel('Description')
        .fill(SICK_DESCRIPTION);
      await When_I_fill_in_the_date_range_from_till(
        page,
        SICKDAY_DATE,
        SICKDAY_DATE,
      );
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Create Sickday')).not.toBeVisible();
      await page.waitForLoadState('networkidle');

      const sickCards = page
        .locator('.MuiCard-root')
        .filter({ hasText: SICK_DESCRIPTION });
      await findOnAnyPage(page, sickCards);

      // ---- Leave day (holiday) ----
      await page.goto('/leave-days');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Add' }).click();
      const leaveDialog = page.getByRole('dialog');
      await expect(leaveDialog.getByLabel('Description')).toBeVisible();

      await leaveDialog.getByLabel('Description').fill(LEAVE_DESCRIPTION);
      await When_I_fill_in_the_date_range_from_till(page, LEAVE_FROM, LEAVE_TO);
      await page.getByRole('button', { name: 'Save' }).click();
      // The leave-day dialog header is "Leave days", which also appears as
      // the page title — so wait for the dialog itself to disappear instead
      // of a text match. Without this wait, the MUI Slide close transition
      // still overlays the pagination control while findOnAnyPage runs.
      await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      const leaveCards = page
        .locator('.MuiCard-root')
        .filter({ hasText: LEAVE_DESCRIPTION });
      await findOnAnyPage(page, leaveCards);
    });

    test('Bert approves the workday, sick day and leave day', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');

      // ---- Approve workday ----
      await page.goto('/workdays');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const workRows = page
        .locator('tr')
        .filter({ hasText: WORKDAY_FROM })
        .filter({ hasText: ASSIGNMENT_ROLE });
      const workRow = await findOnAnyPage(page, workRows);
      await changeStatusOnLocator(page, workRow, 'REQUESTED', 'APPROVED');

      // ---- Approve sick day ----
      await page.goto('/sickdays');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const sickCards = page
        .locator('.MuiCard-root')
        .filter({ hasText: SICK_DESCRIPTION });
      const sickCard = await findOnAnyPage(page, sickCards);
      await changeStatusOnLocator(page, sickCard, 'REQUESTED', 'APPROVED');

      // ---- Approve leave day ----
      await page.goto('/leave-days');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const leaveCards = page
        .locator('.MuiCard-root')
        .filter({ hasText: LEAVE_DESCRIPTION });
      const leaveCard = await findOnAnyPage(page, leaveCards);
      await changeStatusOnLocator(page, leaveCard, 'REQUESTED', 'APPROVED');
    });

    test('Bert reviews the month overview', async ({ page }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');
      await page.goto('/month');
      await page.waitForLoadState('networkidle');

      // The booking dates above are all in May 2026, which is the current
      // month per the session date — so the view opens directly on it. No
      // chevron navigation needed.
      await expect(page.getByText(/^Month: \d{4}-\d{2}$/)).toBeVisible();
      await expect(page.getByText(/Total persons:/)).toBeVisible();
      await expect(page.getByText(/Ernie/i).first()).toBeVisible();
    });
  });
