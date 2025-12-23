import { test } from '@playwright/test';
import {
  Given_I_am_logged_in_as_user,
  When_I_go_to_my_work_days,
  Then_I_see_a_list_of_the_hours_I_have_submitted_as_for,
  When_I_click_the_button,
  When_I_select_the_assignment,
  When_I_fill_in_the_date_range_from_till,
  Then_I_see_the_new_work_days_for_the_month_with_hours,
  When_I_go_to_my_expenses,
  Then_I_am_on_the_create_expense_page,
  When_I_fill_in_the_expense_details,
  Then_I_see_the_expense_as
} from './steps/workdaySteps';

test.describe('Workday scenarios', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies first
    await context.clearCookies();
  });

  test.afterEach(async ({ page, context }) => {
    // Clean up after each test to ensure isolation
    await context.clearCookies();
    await page.evaluate(() => {
      if (typeof window.localStorage !== 'undefined') window.localStorage.clear();
      if (typeof window.sessionStorage !== 'undefined') window.sessionStorage.clear();
    });
  });

  // TODO make sure ernie user has assignment
  test.skip('Submitting worked hours', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'ernie');
    await When_I_go_to_my_work_days(page);
    await Then_I_see_a_list_of_the_hours_I_have_submitted_as_for(
      page,
      "Junior software engineer",
      "Client D"
    );

    await When_I_click_the_button(page, 'Add');
    await When_I_select_the_assignment(page, 'Client A');
    await When_I_fill_in_the_date_range_from_till(page, '01-04-2026', '30-04-2026');
    // TODO: File upload causes a call to Google storage API, which is not mocked.
    // await When_I_add_a_file(page, 'timesheet.png');
    await When_I_click_the_button(page, 'Save');
    // await Then_the_timesheet_was_uploaded_to_backend(page);
    await Then_I_see_the_new_work_days_for_the_month_with_hours(page, 'April', '2026', '176');
  });

  test('Submitting an expense', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'tommy');
    await When_I_go_to_my_expenses(page);
    // TODO: Need to create a clean user first, this fails on subsequent runs.
    // await Then_I_do_not_see_any_expenses(page);

    await When_I_click_the_button(page, 'Add');
    await Then_I_am_on_the_create_expense_page(page);
    await When_I_fill_in_the_expense_details(page, '10-06-2025', '16.50', 'Some reason');
    // TODO: File upload causes a call to Google storage API, which is not mocked.
    // await When_I_add_a_file(page, 'receipt.jpg');
    await When_I_click_the_button(page, 'Save');
    await Then_I_see_the_expense_as(page, 'Requested', 'Some reason', 'Date: 10-06-2025', '€ 16,50');
  });
});
