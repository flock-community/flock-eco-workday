// Event workflow BDD step helpers. Run against a freshly started dev server (-Pdevelop).
import { type Page, expect } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './workdaySteps';

/**
 * Navigate to the events page as an admin user.
 */
export async function Given_I_am_on_events_page(
  page: Page,
  adminUser: string,
) {
  await Given_I_am_logged_in_as_user(page, adminUser);
  await page.goto('/event');
  await expect(
    page.getByRole('heading', { name: 'Events' }),
  ).toBeVisible();
}

/**
 * Click the "Add" button to open the EventDialog for creating a new event.
 */
export async function When_I_click_add_event(page: Page) {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('form#event-form')).toBeVisible();
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
  // Fill Description
  await page.getByLabel('Description').fill(options.description);

  // Fill Budget (clear first)
  const budgetField = page.getByLabel('Budget');
  await budgetField.clear();
  await budgetField.fill(options.budget);

  // Select Event type via MUI Select
  const eventTypeControl = page
    .locator('.MuiFormControl-root')
    .filter({ hasText: 'Event type' })
    .first();
  await eventTypeControl.getByRole('combobox').click();
  await page.getByRole('option', { name: options.eventType }).click();

  // Set From date
  const fromInput = page.getByLabel('From');
  await fromInput.fill(options.from);

  // Set To date
  const toInput = page.getByLabel('To');
  await toInput.fill(options.to);
}

/**
 * Add a participant to the event via the PersonSelectorField MUI Autocomplete.
 */
export async function When_I_add_participant(
  page: Page,
  personName: string,
) {
  const personInput = page.getByLabel('Person');
  await personInput.click();
  await personInput.fill(personName);
  await page.waitForTimeout(500);
  await page
    .getByRole('option', { name: new RegExp(personName, 'i') })
    .click();
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
 */
export async function When_I_open_event_by_description(
  page: Page,
  description: string,
) {
  await page
    .locator('.MuiCard-root')
    .filter({ hasText: description })
    .first()
    .click();
  await expect(page.locator('form#event-form')).toBeVisible();
  await page.waitForLoadState('networkidle');
}

/**
 * Expand the top-level budget accordion in the EventDialog.
 * The EventBudgetSummaryBanner is rendered inside the AccordionSummary,
 * showing participant count and allocation info.
 */
export async function When_I_expand_budget_accordion(page: Page) {
  // The budget accordion is inside the EventDialog, after the form.
  // Its AccordionSummary contains the EventBudgetSummaryBanner with "participant" text.
  const budgetAccordion = page
    .locator('.MuiAccordion-root')
    .filter({ hasText: 'participant' })
    .first();
  await budgetAccordion
    .locator('.MuiAccordionSummary-root')
    .first()
    .click();
  // Wait for accordion details to be visible
  await expect(
    budgetAccordion.locator('.MuiAccordionDetails-root'),
  ).toBeVisible({ timeout: 5000 });
}

/**
 * Expand the "Time Budget Allocations" sub-accordion inside the budget section.
 */
export async function When_I_expand_time_accordion(page: Page) {
  await page.getByText('Time Budget Allocations').click();
  await expect(page.getByText('Time Allocation')).toBeVisible();
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
  // Find the participant row containing the person name and click its Customize button
  const participantRow = page
    .locator('div')
    .filter({ hasText: new RegExp(personName) })
    .filter({ has: page.getByRole('button', { name: 'Customize' }) })
    .first();
  await participantRow
    .getByRole('button', { name: 'Customize' })
    .click();
}

/**
 * Save the event by clicking the Save button in the DialogFooter.
 * Handles the close-warning ConfirmDialog if budget changes are dirty.
 */
export async function When_I_save_event(page: Page) {
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState('networkidle');

  // Handle close-warning ConfirmDialog if it appears
  const closeWarning = page.getByText('You have unsaved budget changes');
  if (await closeWarning.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Assert that an event with the given description exists in the EventList.
 */
export async function Then_event_list_contains(
  page: Page,
  description: string,
) {
  await expect(
    page
      .locator('.MuiCard-root')
      .filter({ hasText: description })
      .first(),
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
