import { expect, Page } from '@playwright/test';
import dayjs from 'dayjs';

export async function Given_I_am_logged_in_as_user(page, username: string) {
  await page.goto('http://localhost:3000/auth');
  await page.getByLabel('Username').fill(`${username}@sesam.straat`);
  await page.getByLabel('Password').fill(username);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('http://localhost:3000/**');
  const welcomeMessage = await page.getByRole('heading', { level: 2, name: `Hi, ${username}!` });
  await expect(welcomeMessage).toBeVisible();
}

export async function When_I_go_to_my_work_days(page) {
  await page.goto('http://localhost:3000/workdays');
}

export async function Then_I_see_a_list_of_the_hours_I_have_submitted_as_for(page, role: string, client: string) {
  const firstRow = page.locator('table tbody tr').first();
  const clientElement = firstRow.locator('td').nth(0);
  await expect(clientElement).toHaveText(client);
  const roleElement = firstRow.locator('td').nth(1);
  await expect(roleElement).toHaveText(role);
}

export async function When_I_click_the_button(page, buttonText: string) {
  const button = await page.getByRole('button', { name: buttonText });
  await button.click();
}

export async function selectDateInPicker(page: Page, dateLabel: string, day: number, month: number, year: number) {
  await page.getByLabel(dateLabel, {exact: true}).click();
  const datePicker = page.getByRole('dialog');
  const monthYearElement = datePicker.locator('.MuiPickersCalendarHeader-transitionContainer p');
  const targetDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
  const today = dayjs();
  let currentMonthYear = await monthYearElement.textContent();
  let [currentMonth, currentYear] = currentMonthYear.split(' ');
  let targetMonth = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const isFuture = targetDate.isAfter(today, 'month');
  const navButton = isFuture
    ? datePicker.locator('.MuiPickersCalendarHeader-switchHeader button').nth(1)
    : datePicker.locator('.MuiPickersCalendarHeader-switchHeader button').first();
  while (currentMonth !== targetMonth || currentYear !== year.toString()) {
    await navButton.click();
    await page.waitForTimeout(500);
    currentMonthYear = await monthYearElement.textContent();
    [currentMonth, currentYear] = currentMonthYear.split(' ');
  }
  const dayButtons = await datePicker.locator(`button[type="button"]:not(.MuiPickersDay-hidden)`).all();
  for (const btn of dayButtons) {
    const btnText = await btn.textContent();
    if (btnText === `${day}`) {
      await btn.click();
      break;
    }
  }
  await datePicker.getByRole('button', {name: 'OK'}).click();
}

export async function When_I_fill_in_the_date_range_from_till(page: Page, fromDate: string, tillDate: string) {
  const [fromDay, fromMonth, fromYear] = fromDate.split('-').map(Number);
  const [tillDay, tillMonth, tillYear] = tillDate.split('-').map(Number);
  const from = dayjs(`${fromYear}-${fromMonth.toString().padStart(2, '0')}-${fromDay.toString().padStart(2, '0')}`);
  const to = dayjs(`${tillYear}-${tillMonth.toString().padStart(2, '0')}-${tillDay.toString().padStart(2, '0')}`);
  const today = dayjs();
  if (to.isAfter(today, 'month')) {
    await selectDateInPicker(page, 'To', tillDay, tillMonth, tillYear);
  }
  if (from.isBefore(today, 'month')) {
    await selectDateInPicker(page, 'From', fromDay, fromMonth, fromYear);
  }
  if (!to.isAfter(today, 'month')) {
    await selectDateInPicker(page, 'To', tillDay, tillMonth, tillYear);
  }
  if (!from.isBefore(today, 'month')) {
    await selectDateInPicker(page, 'From', fromDay, fromMonth, fromYear);
  }
}

export async function When_I_add_a_file(page, filename: string) {
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles(`tests/files/${filename}`);
}

export async function Then_I_see_the_new_work_days_for_the_month_with_hours(page, month: string, year: string, totalHours: string) {
  await page.waitForLoadState('networkidle');
  const firstRow = page.locator('table tbody tr').first();
  const hoursElement = firstRow.locator('td').nth(5);
  await expect(hoursElement).toHaveText(totalHours);
}

export async function Then_the_timesheet_was_uploaded_to_backend(page) {
  const request = await page.waitForRequest(request => 
    request.url().includes('/api/workdays') && request.method() === 'POST'
  );
  expect(request.method()).toBe('POST');
}

export async function When_I_go_to_my_expenses(page) {
  await page.goto('http://localhost:3000/expenses');
}

export async function Then_I_do_not_see_any_expenses(page) {
  const noExpensesMessage = await page.getByText('No expenses');
  await expect(noExpensesMessage).toBeVisible();
}

export async function Then_I_am_on_the_create_expense_page(page) {
  const createExpenseText = await page.getByText('Create expense');
  await expect(createExpenseText).toBeVisible();
}

export async function When_I_fill_in_the_expense_details(page: Page, date: string, amount: string, description: string) {
  const [day, month, year] = date.split('-').map(Number);
  await selectDateInPicker(page, 'Date', day, month, year);
  await page.fill('input[type="number"]', amount);
  await page.fill('input[type="text"]', description);
}

export async function Then_I_see_the_expense_as(page, status: string, reason: string, date: string, total: string) {
  const containerCard = page.locator('.MuiCard-root').filter({ hasText: 'Expenses' }).first();
  const expenseCard = containerCard.locator('.MuiCard-root').first();
  const statusButton = expenseCard.getByText(status.toUpperCase(), { exact: true });
  await expect(statusButton).toBeVisible();
  await expect(expenseCard).toContainText(reason);
  await expect(expenseCard).toContainText(date);
  await expect(expenseCard).toContainText(total);
}

export async function When_I_select_the_assignment(page, assignmentText: string) {
  await page.getByLabel('Assignment').click();
  await page.getByRole('option', { name: new RegExp(assignmentText, 'i') }).click();
} 