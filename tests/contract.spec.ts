import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const CONTRACT_URL = '/contracts';
const ADMIN_USERNAME = 'bert';
const TEST_PERSON = 'Tommy Dog';

test.describe('Contract CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(CONTRACT_URL);
    await page.waitForLoadState('networkidle');
  });

  async function selectPerson(page, personName: string) {
    const personSelect = page.getByRole('combobox');
    await personSelect.click();
    await page.getByRole('option', { name: personName }).click();
    await page.waitForLoadState('networkidle');
  }

  test('should display existing contracts for a person', async ({ page }) => {
    await selectPerson(page, TEST_PERSON);

    await expect(page.getByText('Contracts')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });

  test('should create a new internal contract', async ({ page }) => {
    await selectPerson(page, TEST_PERSON);

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await expect(page.locator('#contract-type-select')).toBeVisible();

    await page.getByLabel('Monthly salary').clear();
    await page.getByLabel('Monthly salary').fill('5000');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('36');

    const startDate = page.getByLabel('Start date');
    await startDate.click();
    await startDate.fill('01-01-2040');
    await startDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText('Monthly salary: 5000').first()).toBeVisible({ timeout: 30000 });
  });

  test('should update an existing contract', async ({ page }) => {
    await selectPerson(page, TEST_PERSON);

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Monthly salary').clear();
    await page.getByLabel('Monthly salary').fill('4500');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('32');

    const startDate = page.getByLabel('Start date');
    await startDate.click();
    await startDate.fill('01-02-2040');
    await startDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Monthly salary: 4500').first()).toBeVisible({ timeout: 30000 });

    await page.getByText('Monthly salary: 4500').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Monthly salary').clear();
    await page.getByLabel('Monthly salary').fill('6000');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText('Monthly salary: 6000').first()).toBeVisible({ timeout: 30000 });
  });

  test('should delete a contract', async ({ page }) => {
    await selectPerson(page, TEST_PERSON);

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Monthly salary').clear();
    await page.getByLabel('Monthly salary').fill('3500');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('20');

    const startDate = page.getByLabel('Start date');
    await startDate.click();
    await startDate.fill('01-03-2040');
    await startDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Monthly salary: 3500').first()).toBeVisible({ timeout: 30000 });

    await page.getByText('Monthly salary: 3500').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(
      page.getByText('Are you sure you would like to delete contract:'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Monthly salary: 3500')).not.toBeVisible();
  });
});
