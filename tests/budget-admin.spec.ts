// Budget admin e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false). Order matters: view -> create -> edit -> delete.
// Target person: pino@sesam.straat. Admin user: bert.
//
// Dev data for pino (current year):
//   Contract: hackHours=160, studyHours=100, studyMoney=EUR2500
//   Allocations: 1 HackTime event-linked (16h, "Hack Day - March")
//   Expected summary: Hack(budget=160, used=16, avail=144), Study(budget=100, used=0, avail=100), Money(budget=€2.500, used=€0, avail=€2.500)
//
// Note: BudgetCard renders EUR values with the € symbol and nl-NL locale
//   (e.g., 2500 -> "€2.500", 350 -> "€350", 0 -> "€0")
//   StudyMoneyAllocationListItem renders amounts with 2 decimal places
//   (e.g., 350 -> "€350,00")
import { test } from '@playwright/test';
import {
  Given_I_am_on_budget_tab_for_person,
  Then_summary_card_shows,
  When_I_click_add_study_money,
  When_I_fill_study_money_form,
  When_I_click_create_button,
  Then_allocation_list_contains,
  When_I_delete_allocation,
  Then_allocation_list_does_not_contain,
} from './steps/budgetSteps';

test.describe('Budget Admin - View and Create', () => {
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

  test('BMGT-01: View budget summary cards for pino', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Verify all three summary cards show correct values.
    // BudgetCard renders: h4 = available value, "Budget: X" and "Used: X" as body2.
    // For hours: format is "{value}h", for money: format is "€{value}" with nl-NL locale (no decimals).
    await Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h');
    await Then_summary_card_shows(page, 'Study Hours', '100h', '100h', '0h');
    await Then_summary_card_shows(page, 'Study Money', '€2.500', '€2.500', '€0');

    // Verify allocation list shows the event-linked hack day allocation
    await Then_allocation_list_contains(page, 'Hack Day - March', '16');
  });

  test('BMGT-02: Create standalone study money allocation', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Click Add Study Money button
    await When_I_click_add_study_money(page);

    // Fill in study money form.
    // Use a date in current year, amount 350, meaningful description.
    const currentYear = new Date().getFullYear();
    await When_I_fill_study_money_form(
      page,
      'Playwright test course',
      '350',
      `${currentYear}-06-15`,
    );

    // Submit
    await When_I_click_create_button(page);

    // Verify new allocation appears in list.
    // StudyMoneyAllocationListItem renders amount as "€{amount}" with 2 decimal nl-NL places, e.g., "350,00"
    await Then_allocation_list_contains(page, 'Playwright test course', '350,00');

    // Verify summary card updated: study money used should now be €350, available €2.150
    await Then_summary_card_shows(page, 'Study Money', '€2.150', '€2.500', '€350');
  });
});

test.describe('Budget Admin - Edit and Delete', () => {
  // Tests in this describe block run after "View and Create".
  // BMGT-06 depends on the "Playwright test course" allocation created by BMGT-02.

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

  // BMGT-03: Edit study money allocation
  // onEdit is NOT passed from BudgetAllocationFeature to BudgetAllocationList,
  // so the edit IconButton (aria-label="edit") does not render for study money items.
  // This test is marked fixme to document the gap without blocking the suite.
  test.fixme(
    'BMGT-03: Edit study money allocation',
    async ({ page }) => {
      // Edit button not rendered — onEdit is not wired in BudgetAllocationFeature.tsx.
      // BudgetAllocationFeature passes only onDelete to BudgetAllocationList; onEdit is omitted.
      // When onEdit is wired, this test should:
      //   1. Navigate to budget tab for pino
      //   2. Find the "Playwright test course" allocation card
      //   3. Click the edit button (aria-label="edit")
      //   4. Change amount to 500 in the dialog
      //   5. Click Save/Update
      //   6. Verify the list shows the updated amount "500,00"
      //   7. Verify summary card shows used=€500, available=€2.000
      await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    },
  );

  // BMGT-04: Edit study time allocation
  // Pino has no standalone study time allocations in dev data.
  // Study time allocations are created via events and are event-linked;
  // event allocations have no edit/delete buttons by design.
  test.fixme(
    'BMGT-04: Edit study time allocation',
    async ({ page }) => {
      // Skipped: No standalone study time allocations exist for pino in dev data.
      // Study time for pino comes only from event-linked allocations (e.g., "Hack Day - March"),
      // which are managed from the Events page and do not expose edit buttons.
      await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    },
  );

  // BMGT-05: Edit hack time allocation
  // Pino's hack time is event-linked ("Hack Day - March").
  // Event allocations are managed from the Events page and do not expose edit buttons.
  test.fixme(
    'BMGT-05: Edit hack time allocation',
    async ({ page }) => {
      // Skipped: Pino's hack time allocation is event-linked (eventCode set).
      // Event allocations are grouped under EventAllocationListItem which has no edit/delete buttons.
      // To edit event-linked allocations, navigate to the Events page.
      await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    },
  );

  // BMGT-06: Delete study money allocation
  // onDelete IS wired in BudgetAllocationFeature, so the delete flow is fully functional.
  // This test depends on the "Playwright test course" allocation created by BMGT-02.
  test('BMGT-06: Delete study money allocation', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Verify the allocation from BMGT-02 exists before attempting deletion.
    // After BMGT-02: study money used=€350, available=€2.150
    await Then_allocation_list_contains(page, 'Playwright test course', '350,00');

    // Delete via confirm dialog: clicks delete button, waits for ConfirmDialog, clicks Confirm
    await When_I_delete_allocation(page, 'Playwright test course');

    // Verify the allocation is no longer in the list
    await Then_allocation_list_does_not_contain(page, 'Playwright test course');

    // Verify summary card reverted to original values: used=€0, available=€2.500
    await Then_summary_card_shows(page, 'Study Money', '€2.500', '€2.500', '€0');
  });
});
