// Employee view and contract e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false).
// Employee user: pino@sesam.straat (password: pino).
// Admin user: bert@sesam.straat (password: bert).
//
// Dev data for pino (current year):
//   Contract: hackTimeBudget=160, trainingTimeBudget=200, trainingMoneyBudget=EUR5000
//   Hours are deterministic: hack=16h used, training=0h used.
//   Training money "used" fluctuates (~€3.182 ± €50) due to syncBudgetAllocations across 26 events.
//
// Assertion strategy:
//   - Hours: exact assertions (deterministic)
//   - Training money: verify budget is €5.000, used > 0 (exact amount not asserted)
import { expect, test } from '@playwright/test';
import {
  Given_I_am_on_budget_tab_for_person,
  Then_allocation_list_contains,
  Then_summary_card_shows,
} from './steps/budgetSteps';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

test.describe('Employee View (Read-Only)', () => {
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

  test('EMPV-01: Employee views budget summary cards', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'pino');
    await page.goto('/budget-allocations');
    // Wait for budget data to actually load -- networkidle fires before React state updates
    await expect(
      page.getByRole('heading', { name: 'Hack Hours', level: 6 }),
    ).toBeVisible({ timeout: 15000 });

    await Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h');
    await Then_summary_card_shows(page, 'Training Hours', '200h', '200h', '0h');

    // Training money: budget is deterministic, used fluctuates — only verify budget
    await Then_summary_card_shows(page, 'Training Money', null, '€5.000', null);
  });

  test('EMPV-02: Employee sees allocation list with correct details', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, 'pino');
    await page.goto('/budget-allocations');
    await expect(
      page.getByRole('heading', { name: 'Hack Hours', level: 6 }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole('heading', { name: /Budget Allocations/i }),
    ).toBeVisible();

    // EventAllocationListItem may render differently than TrainingMoneyAllocationListItem,
    // so use a direct locator as fallback.
    const paper = page
      .locator('.MuiPaper-root')
      .filter({ hasText: 'Budget Allocations' });
    await expect(
      paper.locator('.MuiCard-root').filter({ hasText: 'Hack Time' }).first(),
    ).toBeVisible();
    await expect(
      paper.locator('.MuiCard-root').filter({ hasText: '16h' }).first(),
    ).toBeVisible();
  });

  test('EMPV-03: Employee cannot create, edit, or delete allocations', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, 'pino');
    await page.goto('/budget-allocations');
    await expect(
      page.getByRole('heading', { name: 'Hack Hours', level: 6 }),
    ).toBeVisible({ timeout: 15000 });

    // PersonSelector renders inside a FormControl with "Person" label -- should not exist for employees
    const personControl = page
      .locator('.MuiFormControl-root')
      .filter({ hasText: 'Person' });
    await expect(personControl).not.toBeVisible();

    await expect(page.getByRole('button', { name: 'Add' })).not.toBeVisible();

    const paper = page
      .locator('.MuiPaper-root')
      .filter({ hasText: 'Budget Allocations' });
    await expect(paper.getByRole('button', { name: 'edit' })).not.toBeVisible();
    await expect(
      paper.getByRole('button', { name: 'delete' }),
    ).not.toBeVisible();
  });
});

/**
 * Helper: Navigate to contracts page, select a person, open their INTERNAL contract.
 * Returns after the contract dialog is visible.
 */
async function openInternalContract(
  page: import('@playwright/test').Page,
  personName: string,
) {
  await Given_I_am_logged_in_as_user(page, 'bert');
  await page.goto('/contracts');
  await page.waitForLoadState('networkidle');

  // PersonLayout uses PersonSelector with label "Select person" (MUI Select)
  const personControl = page
    .locator('.MuiFormControl-root')
    .filter({ hasText: 'Select person' })
    .first();
  await personControl.getByRole('combobox').click();
  await page.getByRole('option', { name: new RegExp(personName, 'i') }).click();
  await page.waitForLoadState('networkidle');

  const contractCard = page
    .locator('.MuiCard-root')
    .filter({ hasText: 'INTERNAL' })
    .first();
  await contractCard.click();
  await expect(page.getByText('Contract form')).toBeVisible({ timeout: 10000 });
}

async function saveContract(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Contract form')).not.toBeVisible({
    timeout: 10000,
  });
  await page.waitForLoadState('networkidle');
}

test.describe('Contract Budget Field Impact', () => {
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

  test('CTRT-01: Admin can view and edit contract budget fields', async ({
    page,
  }) => {
    await openInternalContract(page, 'Pino');

    const trainingHoursField = page.getByLabel('Training hours');
    const originalTrainingHours = await trainingHoursField.inputValue();
    await trainingHoursField.clear();
    await trainingHoursField.fill('200');
    await saveContract(page);

    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    const trainingCard = page
      .getByRole('heading', { name: 'Training Hours', level: 6 })
      .locator('xpath=ancestor::*[contains(@class,"MuiCard-root")][1]');
    await expect(trainingCard.getByText('Budget:')).toContainText('200h');

    // Restore the original value so dev data isn't permanently mutated.
    await openInternalContract(page, 'Pino');
    const trainingHoursRestore = page.getByLabel('Training hours');
    await trainingHoursRestore.clear();
    await trainingHoursRestore.fill(originalTrainingHours);
    await saveContract(page);
  });

  test('CTRT-02: Contract budget changes update summary values', async ({
    page,
  }) => {
    await openInternalContract(page, 'Pino');

    const trainingMoneyField = page.getByLabel('Training money');
    const originalTrainingMoney = await trainingMoneyField.inputValue();
    await trainingMoneyField.clear();
    await trainingMoneyField.fill('3500');
    await saveContract(page);

    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    const moneyCard = page
      .getByRole('heading', { name: 'Training Money', level: 6, exact: true })
      .locator('xpath=ancestor::*[contains(@class,"MuiCard-root")][1]');
    await expect(moneyCard.getByText('Budget:')).toContainText('€3.500');

    // Restore the original value so dev data isn't permanently mutated.
    await openInternalContract(page, 'Pino');
    const trainingMoneyRestore = page.getByLabel('Training money');
    await trainingMoneyRestore.clear();
    await trainingMoneyRestore.fill(originalTrainingMoney);
    await saveContract(page);
  });
});
