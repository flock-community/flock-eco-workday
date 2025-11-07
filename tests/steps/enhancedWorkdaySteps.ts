import { expect, Page } from '@playwright/test';
import dayjs from 'dayjs';

/**
 * Clicks on a specific day in the calendar grid and fills in hours
 */
export async function When_I_fill_hours_for_a_specific_day(page: Page, dayNumber: number, hours: number) {
  // Find the calendar grid - use elevation1 to avoid dialog
  const calendarGrid = page.locator('.MuiPaper-elevation1').filter({ hasText: 'Uren vullen voor deze maand' }).first();

  // Wait for calendar to be ready
  await calendarGrid.waitFor({ state: 'visible', timeout: 10000 });

  // Find all day cells
  const dayCells = calendarGrid.locator('[class*="dayCell"]');

  // Find the specific day by looking for the day number span
  const targetDayCell = dayCells.filter({ has: page.locator(`span:has-text("${dayNumber}")`) }).first();

  // Wait for cell to be ready and click with force to avoid overlay issues
  await targetDayCell.waitFor({ state: 'visible', timeout: 5000 });
  await targetDayCell.click({ force: true, timeout: 10000 });

  // Wait for the input field to appear
  const inputField = targetDayCell.locator('input');
  await expect(inputField).toBeVisible({ timeout: 5000 });

  // Clear and fill the input
  await inputField.fill(hours.toString());

  // Press Enter or blur to save
  await inputField.press('Enter');

  // Wait a bit for the value to be saved
  await page.waitForTimeout(500);
}

/**
 * Clicks the quick fill button with specified hours
 */
export async function When_I_use_quick_fill_with_hours(page: Page, hours: number, monthIndex: number = 0) {
  // Find the quick fill button by its text content (just the number: "0", "8", or "9")
  // First, find all month containers - use elevation1 to avoid dialog
  const monthPapers = page.locator('.MuiPaper-elevation1').filter({ hasText: 'Uren vullen voor deze maand' });
  const targetMonth = monthIndex >= 0 ? monthPapers.nth(monthIndex) : monthPapers.first();

  // Find the button with the specific hours value within that month
  const fillButton = targetMonth.getByRole('button', { name: hours.toString(), exact: true });

  await fillButton.click();

  // Wait for the fill operation to complete
  await page.waitForTimeout(500);
}

/**
 * Clicks the "Add month" button
 */
export async function When_I_add_a_new_month(page: Page) {
  const addMonthButton = page.getByRole('button', { name: /maand toevoegen/i });
  await addMonthButton.click();

  // Wait for the new month to be added
  await page.waitForTimeout(500);
}

/**
 * Removes a month by clicking its delete button
 */
export async function When_I_remove_a_month(page: Page, monthIndex: number) {
  // Find all month papers - use elevation1 to avoid dialog
  const monthPapers = page.locator('.MuiPaper-elevation1').filter({ hasText: 'Uren vullen voor deze maand' });

  // Select the specific month
  const targetMonth = monthPapers.nth(monthIndex);

  // Find the delete button (IconButton with DeleteIcon)
  // It's the only IconButton in the month header area
  const deleteButton = targetMonth.locator('.MuiIconButton-colorSecondary');

  await deleteButton.click();

  // Wait for the month to be removed
  await page.waitForTimeout(500);
}

/**
 * Verifies that a month selector exists for the given year and month
 */
export async function Then_I_see_the_month_selector_for(page: Page, year: number, month: number) {
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  // Wait for any month paper to be visible first
  await page.locator('.MuiPaper-elevation1').filter({
    hasText: 'Uren vullen voor deze maand'
  }).first().waitFor({ state: 'visible', timeout: 10000 });

  // Give selectors time to update
  await page.waitForTimeout(1000);

  // Find month papers that contain both the year and month name
  // Use .MuiPaper-elevation1 to avoid matching the dialog itself
  const monthPaper = page.locator('.MuiPaper-elevation1').filter({
    hasText: 'Uren vullen voor deze maand'
  }).filter({
    has: page.locator('.MuiSelect-root').filter({ hasText: year.toString() })
  }).filter({
    has: page.locator('.MuiSelect-root').filter({ hasText: monthNames[month] })
  }).first();

  await expect(monthPaper).toBeVisible({ timeout: 10000 });
}

/**
 * Verifies the calendar grid is visible
 */
export async function Then_I_see_the_calendar_grid(page: Page) {
  // Wait for calendar container to load
  const calendarContainer = page.locator('[class*="calendarContainer"]');
  await expect(calendarContainer).toBeVisible({ timeout: 15000 });

  // Look for day headers (Ma, Di, Wo, etc.) which are always present
  const mondayHeader = page.locator('[class*="dayHeader"]').filter({ hasText: 'Ma' }).first();
  await expect(mondayHeader).toBeVisible({ timeout: 10000 });

  // Look for week rows - at least one should be visible
  const weekRow = page.locator('[class*="weekRow"]').first();
  await expect(weekRow).toBeVisible({ timeout: 10000 });
}

/**
 * Verifies the total hours displayed
 */
export async function Then_I_see_the_total_hours_as(page: Page, options: { exact?: number; minimum?: number; maximum?: number }) {
  // The enhanced dialog shows "Maand Totaal:" or "Totaal Alle Maanden:"
  // Find the total heading (h4 element showing the total number)
  const totalHeading = page.getByRole('heading', { level: 4 });
  await expect(totalHeading).toBeVisible({ timeout: 10000 });

  const totalText = await totalHeading.textContent();
  const totalHours = parseFloat(totalText || '0');

  if (options.exact !== undefined) {
    expect(totalHours).toBe(options.exact);
  }

  if (options.minimum !== undefined) {
    expect(totalHours).toBeGreaterThanOrEqual(options.minimum);
  }

  if (options.maximum !== undefined) {
    expect(totalHours).toBeLessThanOrEqual(options.maximum);
  }
}

/**
 * Verifies a specific day shows the expected hours
 */
export async function Then_I_see_day_with_hours(page: Page, dayNumber: number, expectedHours: number) {
  const calendarGrid = page.locator('.MuiPaper-elevation1').filter({ hasText: 'Uren vullen voor deze maand' }).first();

  // Find the specific day cell
  const dayCells = calendarGrid.locator('[class*="dayCell"]');
  const targetDayCell = dayCells.filter({ has: page.locator(`span:has-text("${dayNumber}")`) }).first();

  // Find the hours display within the cell
  const hoursDisplay = targetDayCell.locator('[class*="hoursDisplay"]');

  await expect(hoursDisplay).toHaveText(expectedHours.toString());
}

/**
 * Changes the month selector to a specific year and month
 */
export async function When_I_change_month_selector_to(page: Page, monthIndex: number, year: number, month: number) {
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  // Find all month papers - use elevation1 to avoid dialog
  const monthPapers = page.locator('.MuiPaper-elevation1').filter({ hasText: 'Uren vullen voor deze maand' });
  const targetMonth = monthPapers.nth(monthIndex);

  // Click the year selector
  const yearSelector = targetMonth.locator('.MuiSelect-root').filter({ hasText: /^\d{4}$/ }).first();
  await yearSelector.click();

  // Select the year from the dropdown
  await page.getByRole('option', { name: year.toString(), exact: true }).click();

  // Wait a bit
  await page.waitForTimeout(300);

  // Click the month selector
  const monthSelector = targetMonth.locator('.MuiSelect-root').filter({
    hasText: new RegExp(monthNames.join('|'))
  }).first();
  await monthSelector.click();

  // Select the month from the dropdown
  await page.getByRole('option', { name: monthNames[month], exact: true }).click();

  // Wait for the calendar to update
  await page.waitForTimeout(500);
}

/**
 * Toggles the weekend display checkbox
 */
export async function When_I_toggle_weekend_display(page: Page, enabled: boolean) {
  const weekendCheckbox = page.getByLabel(/toon weekend dagen/i);

  const isChecked = await weekendCheckbox.isChecked();

  if ((enabled && !isChecked) || (!enabled && isChecked)) {
    await weekendCheckbox.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Verifies weekend days are visible in the calendar
 */
export async function Then_I_see_weekend_days(page: Page) {
  // Check if 'Za' and 'Zo' headers are visible
  const saturdayHeader = page.locator('[class*="dayHeader"]').filter({ hasText: 'Za' });
  const sundayHeader = page.locator('[class*="dayHeader"]').filter({ hasText: 'Zo' });

  await expect(saturdayHeader).toBeVisible();
  await expect(sundayHeader).toBeVisible();
}

/**
 * Verifies weekend days are not visible in the calendar
 */
export async function Then_I_do_not_see_weekend_days(page: Page) {
  // Check if 'Za' and 'Zo' headers are not visible
  const saturdayHeader = page.locator('[class*="dayHeader"]').filter({ hasText: 'Za' });
  const sundayHeader = page.locator('[class*="dayHeader"]').filter({ hasText: 'Zo' });

  await expect(saturdayHeader).not.toBeVisible();
  await expect(sundayHeader).not.toBeVisible();
}

/**
 * Enables the free day option with specified settings
 */
export async function When_I_enable_free_day_option(page: Page, frequency: 'every' | 'odd' | 'even', dayOfWeek: number) {
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const frequencyNames = {
    'every': 'Elke week',
    'odd': 'Oneven weken',
    'even': 'Even weken'
  };

  // Enable the free day checkbox
  const freeDayCheckbox = page.getByLabel(/vrije dag optie/i);
  const isChecked = await freeDayCheckbox.isChecked();

  if (!isChecked) {
    await freeDayCheckbox.click();
    await page.waitForTimeout(300);
  }

  // Select frequency
  const frequencySelector = page.locator('.MuiSelect-root').filter({
    hasText: new RegExp(Object.values(frequencyNames).join('|'))
  }).first();
  await frequencySelector.click();
  await page.getByRole('option', { name: frequencyNames[frequency] }).click();
  await page.waitForTimeout(300);

  // Select day of week
  const daySelector = page.locator('.MuiSelect-root').filter({
    hasText: new RegExp(dayNames.join('|'))
  }).first();
  await daySelector.click();
  await page.getByRole('option', { name: dayNames[dayOfWeek] }).click();
  await page.waitForTimeout(300);
}

/**
 * Verifies the date range display
 */
export async function Then_I_see_the_date_range_as(page: Page, fromDate: Date, toDate: Date) {
  const dateRangeHeader = page.locator('[class*="dateRangeHeader"]');
  await expect(dateRangeHeader).toBeVisible();

  // Format dates to match the expected format (DD MMM YYYY)
  const formatDate = (date: Date) => {
    return dayjs(date).format('DD MMM YYYY');
  };

  const expectedText = `${formatDate(fromDate)} - ${formatDate(toDate)}`;

  // The text might contain "Geselecteerd bereik:" prefix
  await expect(dateRangeHeader).toContainText(formatDate(fromDate));
  await expect(dateRangeHeader).toContainText(formatDate(toDate));
}

/**
 * Verifies the legend shows specific hours for a category
 */
export async function Then_I_see_legend_hours_for(page: Page, category: 'Ziekte' | 'Event' | 'Verlof' | 'Overlappend', expectedHours: number) {
  // Find the legend row containing the category text
  const legendRow = page.locator('[class*="summaryRow"]');
  await expect(legendRow).toBeVisible();

  // Find the specific summary item by looking for the text
  const summaryItem = legendRow.locator('[class*="summaryItem"]').filter({ hasText: category });

  // Verify it exists
  await expect(summaryItem).toBeVisible();

  // Get the hours value - it's in a summaryHours element
  const hoursElement = summaryItem.locator('[class*="summaryHours"]');
  const hoursText = await hoursElement.textContent();
  const hours = parseFloat(hoursText || '0');

  expect(hours).toBe(expectedHours);
}

/**
 * Verifies the legend does not show a specific category
 */
export async function Then_I_do_not_see_legend_category(page: Page, category: 'Ziekte' | 'Event' | 'Verlof' | 'Overlappend') {
  // Find the legend row
  const legendRow = page.locator('[class*="summaryRow"]');

  // Try to find the specific summary item
  const summaryItem = legendRow.locator('[class*="summaryItem"]').filter({ hasText: category });

  // Verify it doesn't exist
  await expect(summaryItem).not.toBeVisible();
}
