import { expect, type Locator, type Page, test } from '@playwright/test';
import {
  Given_I_am_logged_in_as_user,
  When_I_fill_in_the_date_range_from_till,
} from './steps/workdaySteps';

// Each run inserts a uniquely identifiable assignment / sick / leave entry so
// we can recognise our own records even when seeded mock data fills the same
// lists. Using a far-future year (2050) keeps the workday, sick day and leave
// day on top of their `from desc` paginated lists, since seeded data only
// reaches up to 2040 (leave) / 2031 (sick) / 2026 (work).
const RUN_ID = Date.now();
const ASSIGNMENT_ROLE = `Workflow tester ${RUN_ID}`;
const ASSIGNMENT_CLIENT = 'Client B';
const ASSIGNMENT_FROM = '01-12-2050';
const ASSIGNMENT_TO = '31-12-2050';
const SICK_DESCRIPTION = `Workflow flu ${RUN_ID}`;
const LEAVE_DESCRIPTION = `Workflow holiday ${RUN_ID}`;

// 2050-12-05 is a Monday, so we get a clean Mon-Fri week for work / leave and
// a single Monday for the sick day.
const WORKDAY_FROM = '05-12-2050';
const WORKDAY_TO = '09-12-2050';
const SICKDAY_DATE = '12-12-2050';
const LEAVE_FROM = '19-12-2050';
const LEAVE_TO = '23-12-2050';

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

// The assignment list controller does not honour `sort=from,desc`, so newly
// created assignments end up on the last page of the paginated list. Iterate
// pages by clicking "Go to next page" until the locator resolves or we run
// out of pages.
async function paginateUntilVisible(page: Page, locator: Locator) {
  const MAX_PAGES = 20;
  for (let i = 0; i < MAX_PAGES; i++) {
    if ((await locator.count()) > 0) return;
    const nextBtn = page.getByRole('button', { name: 'Go to next page' });
    if (
      (await nextBtn.count()) === 0 ||
      !(await nextBtn.isVisible()) ||
      !(await nextBtn.isEnabled())
    ) {
      throw new Error('Locator not found on any page');
    }
    await nextBtn.click();
    await page.waitForLoadState('networkidle');
  }
  throw new Error('Locator not found within pagination limit');
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
      await expect(
        page.getByText('Create / Edit an assignment'),
      ).not.toBeVisible();

      // Ernie has seven seeded Client D assignments, so our new Client B card
      // lives on a later page of the assignment list.
      const heading = page.getByRole('heading', {
        name: `${ASSIGNMENT_CLIENT} - ${ASSIGNMENT_ROLE}`,
      });
      await paginateUntilVisible(page, heading);
      await expect(heading.first()).toBeVisible();
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

      // 2050-12 only overlaps with our new Client B assignment; the existing
      // Client D one ends in 2026, so the AssignmentSelector auto-picks it.
      // Click the dropdown anyway to verify the Client B option is available.
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

      const workRow = page
        .locator('tr')
        .filter({ hasText: WORKDAY_FROM })
        .first();
      await expect(workRow).toBeVisible();
      await expect(workRow).toContainText(ASSIGNMENT_ROLE);
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
      await expect(page.getByText(SICK_DESCRIPTION).first()).toBeVisible();

      // ---- Leave day (holiday) ----
      await page.goto('/leave-days');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Add' }).click();
      const leaveDialog = page.getByRole('dialog');
      await expect(leaveDialog.getByLabel('Description')).toBeVisible();

      await leaveDialog.getByLabel('Description').fill(LEAVE_DESCRIPTION);
      await When_I_fill_in_the_date_range_from_till(page, LEAVE_FROM, LEAVE_TO);
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(LEAVE_DESCRIPTION).first()).toBeVisible();
    });

    test('Bert approves the workday, sick day and leave day', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');

      // ---- Approve workday ----
      await page.goto('/workdays');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const workRow = page
        .locator('tr')
        .filter({ hasText: WORKDAY_FROM })
        .filter({ hasText: ASSIGNMENT_ROLE })
        .first();
      await changeStatusOnLocator(page, workRow, 'REQUESTED', 'APPROVED');

      // ---- Approve sick day ----
      await page.goto('/sickdays');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const sickCard = page
        .locator('.MuiCard-root')
        .filter({ hasText: SICK_DESCRIPTION })
        .first();
      await changeStatusOnLocator(page, sickCard, 'REQUESTED', 'APPROVED');

      // ---- Approve leave day ----
      await page.goto('/leave-days');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const leaveCard = page
        .locator('.MuiCard-root')
        .filter({ hasText: LEAVE_DESCRIPTION })
        .first();
      await changeStatusOnLocator(page, leaveCard, 'REQUESTED', 'APPROVED');
    });

    test('Bert reviews the month overview', async ({ page }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');
      await page.goto('/month');
      await page.waitForLoadState('networkidle');

      // The month view only navigates one month at a time, and our bookings
      // sit decades into the future, so we sanity-check that the chart loads
      // for the current month (where Ernie already has seeded workdays /
      // sick days / leave days) and that Ernie shows up among the persons.
      await expect(page.getByText(/^Month: \d{4}-\d{2}$/)).toBeVisible();
      await expect(page.getByText(/Total persons:/)).toBeVisible();
      await expect(page.getByText(/Ernie/i).first()).toBeVisible();
    });
  });
