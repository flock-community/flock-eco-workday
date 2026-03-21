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
