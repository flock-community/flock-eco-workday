// Budget allocation BDD step helpers. Run against a freshly started dev server (-Pdevelop).
import { type Page, expect } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './workdaySteps';

/**
 * Navigate to the budget allocations page as an admin user and select the given person.
 */
export async function Given_I_am_on_budget_tab_for_person(
  page: Page,
  adminUser: string,
  personName: string,
) {
  await Given_I_am_logged_in_as_user(page, adminUser);
  await page.goto('/budget-allocations');
  // Open the Person MUI Select dropdown — the combobox has no accessible name,
  // so locate via the FormControl container that has the "Person" label text.
  const personControl = page.locator('.MuiFormControl-root').filter({ hasText: 'Person' }).first();
  await personControl.getByRole('combobox').click();
  await page
    .getByRole('option', { name: new RegExp(personName, 'i') })
    .click();
  await page.waitForLoadState('networkidle');
}

/**
 * Assert that a BudgetCard with the given title shows the expected available, budget, and used values.
 *
 * BudgetCard renders:
 *   - subtitle2: cardTitle (e.g., "Hack Hours")
 *   - h4: available value (e.g., "144h" or "€2.500")
 *   - body2: "Budget: {value}" and "Used: {value}"
 */
export async function Then_summary_card_shows(
  page: Page,
  cardTitle: string,
  available: string,
  budget: string,
  used: string,
) {
  // Each BudgetCard has an h6 title — scope to its CardContent to avoid matching parent cards
  const cardContent = page
    .getByRole('heading', { name: cardTitle, level: 6 })
    .locator('xpath=ancestor::*[contains(@class,"MuiCardContent-root")][1]');
  await expect(cardContent.getByRole('heading', { level: 4 })).toContainText(
    available,
  );
  await expect(cardContent.getByText('Budget:')).toContainText(budget);
  await expect(cardContent.getByText('Used:')).toContainText(used);
}

/**
 * Click the "Add Study Money" button and wait for the dialog to open.
 */
export async function When_I_click_add_study_money(page: Page) {
  await page.getByRole('button', { name: 'Add Study Money' }).click();
  await expect(
    page.getByText('Add Study Money Allocation'),
  ).toBeVisible();
}

/**
 * Fill in the study money allocation form fields.
 * date should be in YYYY-MM-DD format (HTML date input native format).
 */
export async function When_I_fill_study_money_form(
  page: Page,
  description: string,
  amount: string,
  date: string,
) {
  await page.getByLabel('Description').fill(description);
  await page.getByLabel('Amount (EUR)').fill(amount);
  const dateInput = page.getByLabel('Date');
  await dateInput.fill(date);
}

/**
 * Click the Create button and wait for the dialog to close and data to refresh.
 */
export async function When_I_click_create_button(page: Page) {
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(
    page.getByText('Add Study Money Allocation'),
  ).not.toBeVisible();
  await page.waitForLoadState('networkidle');
}

/**
 * Assert that the Budget Allocations list contains a card with the given description and amount.
 * The amount text is checked as a substring of the card content.
 */
export async function Then_allocation_list_contains(
  page: Page,
  description: string,
  amount: string,
) {
  // BudgetAllocationList renders inside a Paper with Typography h6 "Budget Allocations (...)"
  const paper = page.locator('.MuiPaper-root').filter({
    hasText: 'Budget Allocations',
  });
  const card = paper.locator('.MuiCard-root').filter({ hasText: description });
  await expect(card.first()).toBeVisible();
  await expect(card.first()).toContainText(amount);
}

/**
 * Assert that the Budget Allocations list does NOT contain a card with the given description.
 */
export async function Then_allocation_list_does_not_contain(
  page: Page,
  description: string,
) {
  const paper = page.locator('.MuiPaper-root').filter({
    hasText: 'Budget Allocations',
  });
  await expect(
    paper.locator('.MuiCard-root').filter({ hasText: description }),
  ).toHaveCount(0);
}

/**
 * Finds the allocation card with the given description and clicks its edit button.
 * The edit button renders as <IconButton aria-label="edit"> when onEdit is wired.
 */
export async function When_I_edit_allocation(page: Page, description: string): Promise<void> {
  const paper = page.locator('.MuiPaper-root').filter({ hasText: 'Budget Allocations' }).first();
  const card = paper.locator('.MuiCard-root').filter({ hasText: description }).first();
  await card.getByRole('button', { name: 'edit' }).click();
  await expect(page.getByText('Edit Study Money Allocation')).toBeVisible();
}

/**
 * Clears the Amount (EUR) field in the open study money dialog and types a new value.
 * Call after When_I_edit_allocation (dialog must already be open).
 */
export async function When_I_update_study_money_amount(page: Page, newAmount: string): Promise<void> {
  const amountField = page.getByLabel('Amount (EUR)');
  await amountField.clear();
  await amountField.fill(newAmount);
}

/**
 * Clicks the "Save" button in the open study money edit dialog.
 * Waits for dialog to close and data to refresh.
 */
export async function When_I_click_save_button(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Edit Study Money Allocation')).not.toBeVisible();
  await page.waitForLoadState('networkidle');
}

/**
 * Find the allocation card matching description, click its delete button,
 * confirm in the ConfirmDialog, and wait for the list to refresh.
 */
export async function When_I_delete_allocation(
  page: Page,
  description: string,
) {
  const paper = page.locator('.MuiPaper-root').filter({
    hasText: 'Budget Allocations',
  });
  const card = paper
    .locator('.MuiCard-root')
    .filter({ hasText: description })
    .first();
  await card.getByRole('button', { name: 'delete' }).click();
  await expect(
    page.getByRole('heading', { name: 'Confirm' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForLoadState('networkidle');
}
