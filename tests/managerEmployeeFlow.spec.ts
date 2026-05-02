import { expect, test } from '@playwright/test';
import {
  Given_I_am_logged_in_as_user,
  When_I_fill_in_the_date_range_from_till,
} from './steps/workdaySteps';

// Make every test run insert a uniquely identifiable assignment / sick / leave entry
// so we can find our records back even when seeded mock data fills the same lists.
const RUN_ID = Date.now();
const ASSIGNMENT_ROLE = `Workflow tester ${RUN_ID}`;
const ASSIGNMENT_CLIENT = 'Client B';
const ASSIGNMENT_FROM = '01-12-2026';
const ASSIGNMENT_TO = '31-12-2026';
const SICK_DESCRIPTION = `Workflow flu ${RUN_ID}`;
const LEAVE_DESCRIPTION = `Workflow holiday ${RUN_ID}`;

// Pick the very end of the year so the new workday lands on top of the
// `from desc` sorted, paginated workday list (page 1).
const WORKDAY_FROM = '28-12-2026';
const WORKDAY_TO = '31-12-2026';
const SICKDAY_DATE = '21-12-2026';
const LEAVE_FROM = '14-12-2026';
const LEAVE_TO = '18-12-2026';
const TARGET_MONTH_LABEL = 'Month: 2026-12';

async function selectErnieFromPersonSelector(page) {
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'Ernie Muppets' }).click();
  await page.waitForLoadState('networkidle');
}

async function changeStatusOnLocator(page, locator, fromStatus, toStatus) {
  await expect(locator).toBeVisible();
  await locator.getByRole('button', { name: fromStatus }).click();
  await page.getByRole('menuitem', { name: toStatus }).click();
  await page.waitForLoadState('networkidle');
  await expect(locator.getByRole('button', { name: toStatus })).toBeVisible();
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

      // Pick Ernie via the page-level person combobox.
      await selectErnieFromPersonSelector(page);

      // Open the create / edit dialog.
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('Create / Edit an assignment')).toBeVisible();

      // Fill in the assignment.
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

      await expect(
        page
          .getByRole('heading', {
            name: `${ASSIGNMENT_CLIENT} - ${ASSIGNMENT_ROLE}`,
          })
          .first(),
      ).toBeVisible();
      await expect(page.getByText('Hourly rate: 95').first()).toBeVisible();
      await expect(page.getByText('Hours per week: 40').first()).toBeVisible();
    });

    test('Ernie books work hours, sick hours and a leave day', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'ernie');

      // ---- Work hours against the new Client B assignment ----
      await page.goto('/workdays');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByText('Create Workday')).toBeVisible();

      // Set the period first so Client B becomes selectable in the dropdown.
      await When_I_fill_in_the_date_range_from_till(
        page,
        WORKDAY_FROM,
        WORKDAY_TO,
      );

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
      // The leave-day dialog has no unique title; wait for the description input
      // inside the dialog to confirm it is open.
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

      // ---- Approve the workday ----
      await page.goto('/workdays');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const workRow = page
        .locator('tr')
        .filter({ hasText: WORKDAY_FROM })
        .filter({ hasText: ASSIGNMENT_ROLE })
        .first();
      await changeStatusOnLocator(page, workRow, 'REQUESTED', 'APPROVED');

      // ---- Approve the sick day ----
      await page.goto('/sickdays');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const sickCard = page
        .locator('.MuiCard-root')
        .filter({ hasText: SICK_DESCRIPTION })
        .first();
      await changeStatusOnLocator(page, sickCard, 'REQUESTED', 'APPROVED');

      // ---- Approve the leave day ----
      await page.goto('/leave-days');
      await page.waitForLoadState('networkidle');
      await selectErnieFromPersonSelector(page);

      const leaveCard = page
        .locator('.MuiCard-root')
        .filter({ hasText: LEAVE_DESCRIPTION })
        .first();
      await changeStatusOnLocator(page, leaveCard, 'REQUESTED', 'APPROVED');
    });

    test('Bert reviews Ernie hours on the month overview', async ({ page }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');
      await page.goto('/month');
      await page.waitForLoadState('networkidle');

      // The month overview opens on the current month (May 2026 per the
      // session date). Click the "next" icon button until we hit December 2026.
      const nextButton = page
        .locator('button:has(svg[data-testid="ChevronRightIcon"])')
        .first();

      for (
        let i = 0;
        i < 12 && !(await page.getByText(TARGET_MONTH_LABEL).isVisible());
        i++
      ) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
      }

      await expect(page.getByText(TARGET_MONTH_LABEL)).toBeVisible();

      // Ernie is on an external contract, so his bar shows up in the External
      // chart. The recharts y-axis renders the person name as SVG text, which
      // Playwright can still query via getByText.
      await expect(page.getByText(/Ernie/i).first()).toBeVisible();
    });
  });
