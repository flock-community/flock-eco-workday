// Event workflow BDD step helpers. Run against a freshly started dev server (-Pdevelop).
import { type Page, expect } from '@playwright/test';
import { Given_I_am_logged_in_as_user, selectDateInPicker } from './workdaySteps';

export async function Given_I_am_on_events_page(
  page: Page,
  adminUser: string,
) {
  await Given_I_am_logged_in_as_user(page, adminUser);
  await page.goto('/event');
  await expect(
    page.locator('.MuiCardHeader-title', { hasText: 'Events' }),
  ).toBeVisible();
}

export async function When_I_click_add_event(page: Page) {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('form#event-form').first()).toBeVisible();
}

/**
 * Fill in the EventForm fields inside the open EventDialog.
 * Dates should be in YYYY-MM-DD format (HTML date input native format).
 * The Default Time Allocation Type is auto-set by event type selection.
 */
export async function When_I_fill_event_form(
  page: Page,
  options: {
    description: string;
    budget: string;
    eventType: string;
    from: string;
    to: string;
    hoursPerDay?: string;
  },
) {
  await page.getByLabel('Description').fill(options.description);

  const budgetField = page.getByLabel('Budget');
  await budgetField.clear();
  await budgetField.fill(options.budget);

  // selectDateInPicker uses DD-MM-YYYY (the MUI DatePicker format).
  // Dates must be set BEFORE event type (event type triggers PeriodInputField which
  // calls .startOf() on from/to dates).
  const [fromYear, fromMonth, fromDay] = options.from.split('-').map(Number);
  const [toYear, toMonth, toDay] = options.to.split('-').map(Number);
  await selectDateInPicker(page, 'From', fromDay, fromMonth, fromYear);
  await selectDateInPicker(page, 'To', toDay, toMonth, toYear);

  const eventTypeControl = page
    .locator('.MuiFormControl-root')
    .filter({ hasText: 'Event type' })
    .first();
  await eventTypeControl.getByRole('combobox').click();
  await page.getByRole('option', { name: options.eventType }).click();
}

export async function When_I_add_participant(
  page: Page,
  personName: string,
) {
  // PersonSelectorField is an MUI multi-Select, not Autocomplete
  const personControl = page
    .locator('.MuiFormControl-root')
    .filter({ hasText: 'Person' })
    .first();
  await personControl.getByRole('combobox').click();
  await page
    .getByRole('option', { name: new RegExp(personName, 'i') })
    .click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Submit the event form by clicking the Save button in the DialogFooter.
 * The DialogFooter renders a submit button with type="submit" form="event-form" and text "Save".
 */
export async function When_I_submit_event_form(page: Page) {
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Open an existing event from the EventList by clicking on its card.
 * Events are sorted by date desc (page size 10). If the heading isn't
 * visible within 5 s the page is reloaded once to pick up a freshly
 * created event that may not have been in the initial list response.
 */
export async function When_I_open_event_by_description(
  page: Page,
  description: string,
) {
  const heading = page.locator('h6').filter({ hasText: description }).first();

  const visible = await heading
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (!visible) {
    await page.goto('/event');
    await expect(
      page.locator('.MuiCardHeader-title', { hasText: 'Events' }),
    ).toBeVisible();
    await heading.waitFor({ state: 'visible', timeout: 10000 });
  }

  await heading.click();
  await expect(page.locator('form#event-form').first()).toBeVisible({
    timeout: 10000,
  });
  await page.waitForLoadState('networkidle');
}

/**
 * Set the Default Time Allocation Type in the EventDialog.
 * @param allocationType - Display text of the option, e.g. "Hack Time (deducts from hack hours budget)"
 */
export async function When_I_set_default_time_allocation_type(
  page: Page,
  allocationType: string,
) {
  const control = page
    .locator('.MuiFormControl-root')
    .filter({ hasText: 'Default Time Allocation Type' })
    .first();
  await control.getByRole('combobox').click();
  await page.getByRole('option', { name: new RegExp(allocationType, 'i') }).click();
}

/**
 * Expand the top-level budget accordion in the EventDialog.
 * The EventBudgetSummaryBanner is rendered inside the AccordionSummary,
 * showing participant count and allocation info.
 */
export async function When_I_expand_budget_accordion(page: Page) {
  const budgetAccordion = page
    .locator('.MuiAccordion-root')
    .filter({ hasText: 'participant' })
    .first();
  await budgetAccordion
    .locator('.MuiAccordionSummary-root')
    .first()
    .click();
  await expect(
    budgetAccordion.locator('.MuiAccordionDetails-root').first(),
  ).toBeVisible({ timeout: 5000 });
}

/**
 * Expand the "Time Budget Allocations" sub-accordion inside the budget section.
 */
export async function When_I_expand_time_accordion(page: Page) {
  await page.getByText('Time Budget Allocations').click();
  await expect(
    page.getByRole('heading', { name: 'Time Allocation', level: 6 }),
  ).toBeVisible();
}

/**
 * Click the "Show all participants" toggle button to reveal participants using defaults.
 */
export async function When_I_click_show_all_participants(page: Page) {
  await page
    .getByRole('button', { name: /Show all participants/i })
    .click();
}

/**
 * Click the "Customize" button on a specific participant's row in the time allocation section.
 * This materializes the default allocation so it can be saved.
 */
export async function When_I_customize_participant_allocation(
  page: Page,
  personName: string,
) {
  const participantRow = page
    .locator('div')
    .filter({ hasText: new RegExp(personName) })
    .filter({ has: page.getByRole('button', { name: 'Customize' }) })
    .first();
  await participantRow
    .getByRole('button', { name: 'Customize' })
    .first()
    .click();
  // Wait for "Remove Custom" button to appear (confirms allocation was materialized)
  await page
    .locator('div')
    .filter({ hasText: new RegExp(personName) })
    .filter({ has: page.getByRole('button', { name: 'Remove Custom' }) })
    .first()
    .waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Save the event by clicking the Save button in the DialogFooter.
 * Waits for the dialog to close (onComplete fires after all saves including allocations).
 * Handles the close-warning ConfirmDialog if budget changes are dirty.
 */
export async function When_I_save_event(page: Page) {
  await page.getByRole('button', { name: 'Save' }).click();

  const closeWarning = page.getByText('You have unsaved budget changes');
  if (await closeWarning.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.getByRole('button', { name: 'Confirm' }).click();
  }

  // Wait for the event dialog to close — onComplete fires only after all allocation saves complete
  await expect(page.locator('.MuiDialog-root form#event-form').first()).not.toBeVisible({ timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

export async function Then_event_list_contains(
  page: Page,
  description: string,
) {
  await expect(
    page.locator('h6').filter({ hasText: description }).first(),
  ).toBeVisible();
}

/**
 * Assert that an event-linked budget allocation appears on the budget tab.
 * Looks for allocation type text (e.g., "Hack Time") and amount (e.g., "8h") in the allocation list.
 */
export async function Then_budget_tab_shows_event_allocation(
  page: Page,
  allocationTypeText: string,
  hoursOrAmount: string,
) {
  const allocationArea = page.locator('.MuiPaper-root').filter({
    hasText: 'Budget Allocations',
  });
  await expect(
    allocationArea.getByText(
      new RegExp(`${allocationTypeText}.*${hoursOrAmount}`),
    ),
  ).toBeVisible();
}

/**
 * Customize a participant's time allocation hours for a specific day in the PeriodInput.
 * The participant must already have a customized allocation (not "Using defaults").
 *
 * @param personName - Display name of the participant (e.g., "Pino")
 * @param periodType - "Study Time" or "Hack Time"
 * @param dayIndex - Zero-based index of the day input within that period section
 * @param hours - New hours value to enter
 */
export async function When_I_customize_participant_hours(
  page: Page,
  personName: string,
  periodType: 'Study Time' | 'Hack Time',
  dayIndex: number,
  hours: string,
) {
  const participantBox = page
    .locator('div')
    .filter({ hasText: new RegExp(`^.*${personName}.*$`) })
    .filter({ has: page.getByRole('button', { name: 'Remove Custom' }) })
    .first();

  // Scroll the participant box into view — it may be below the dialog viewport
  await participantBox.scrollIntoViewIfNeeded();

  // Within that box, find the section heading (Typography subtitle2 with exact text).
  // Navigate up two levels: heading → heading-row Box → section container Box.
  const heading = participantBox.getByText(periodType, { exact: true }).first();
  const periodSection = heading.locator('..').locator('..');

  // The PeriodInput renders TextField type="number" for each day.
  const numberInputs = periodSection.locator('input[type="number"]:not([disabled])');
  const targetInput = numberInputs.nth(dayIndex);
  await targetInput.scrollIntoViewIfNeeded();
  await targetInput.clear();
  await targetInput.fill(hours);
}

/**
 * Remove a participant from the event by deselecting them in the Person MUI multi-Select.
 * The PersonSelector uses a standard MUI Select (not Autocomplete), so toggling
 * a selected MenuItem deselects it.
 *
 * @param personName - The full display name as shown in the select (e.g., "Pino Woodpecker")
 */
export async function When_I_remove_participant_from_event(
  page: Page,
  personName: string,
) {
  const personControl = page
    .locator('.MuiFormControl-root')
    .filter({ hasText: 'Person' })
    .first();
  await personControl.getByRole('combobox').click();
  await page
    .getByRole('option', { name: new RegExp(personName, 'i') })
    .click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Add a second (or additional) participant to an already-populated Person MUI multi-Select.
 * Opens the dropdown and clicks the MenuItem for the given person.
 *
 * @param personName - The full display name (e.g., "Ieniemienie Mouse")
 */
export async function When_I_add_second_participant(
  page: Page,
  personName: string,
) {
  const personControl = page
    .locator('.MuiFormControl-root')
    .filter({ hasText: 'Person' })
    .first();
  await personControl.getByRole('combobox').click();
  await page.waitForTimeout(300);
  await page
    .getByRole('option', { name: new RegExp(personName, 'i') })
    .click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Assert that the collapsed EventBudgetSummaryBanner inside the EventDialog
 * shows both the assigned-per-person and unassigned amounts.
 * The banner is rendered in the AccordionSummary — it must already be visible
 * (call When_I_open_event_by_description first; accordion is collapsed by default).
 *
 * @param assignedPerPersonText - Substring to find, e.g. "assigned €500/person"
 * @param unassignedText - Substring to find, e.g. "€0 unassigned" or "€250 unassigned"
 */
export async function Then_collapsed_banner_shows_money_summary(
  page: Page,
  assignedPerPersonText: string,
  unassignedText: string,
): Promise<void> {
  // The banner renders as a Typography body2 (<p>) inside the AccordionSummary.
  const accordionSummary = page
    .locator('.MuiAccordion-root')
    .filter({ hasText: 'participant' })
    .first()
    .locator('.MuiAccordionSummary-root')
    .first();
  await expect(accordionSummary.locator('p')).toContainText(assignedPerPersonText, { timeout: 5000 });
  await expect(accordionSummary.locator('p')).toContainText(unassignedText, { timeout: 5000 });
}
