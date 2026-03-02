import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const LEAVEDAY_URL = '/leave-days';
const ADMIN_USERNAME = 'bert';
const TEST_PERSON = 'Pino Woodpecker';

test.describe('Leave Day CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(LEAVEDAY_URL);
    await page.waitForLoadState('networkidle');
  });

  async function selectPerson(page, personName: string) {
    const personSelect = page.getByRole('combobox');
    await personSelect.click();
    await page.getByRole('option', { name: personName }).click();
    await page.waitForLoadState('networkidle');
  }

  test('should create a new leave day', async ({ page }) => {
    await selectPerson(page, TEST_PERSON);

    const timestamp = Date.now();
    const description = `TestHoliday-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Description').fill(description);

    const fromDate = page.getByLabel('From', { exact: true });
    await fromDate.click();
    await fromDate.fill('01-07-2040');
    await fromDate.press('Tab');
    await page.waitForTimeout(200);

    const toDate = page.getByLabel('To', { exact: true });
    await toDate.click();
    await toDate.fill('05-07-2040');
    await toDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText(description).first()).toBeVisible({ timeout: 30000 });
  });

  test('should update an existing leave day', async ({ page }) => {
    await selectPerson(page, TEST_PERSON);

    const timestamp = Date.now();
    const description = `EditHoliday-${timestamp}`;
    const updatedDescription = `UpdatedHoliday-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Description').fill(description);

    const fromDate = page.getByLabel('From', { exact: true });
    await fromDate.click();
    await fromDate.fill('10-07-2040');
    await fromDate.press('Tab');
    await page.waitForTimeout(200);

    const toDate = page.getByLabel('To', { exact: true });
    await toDate.click();
    await toDate.fill('12-07-2040');
    await toDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(description).first()).toBeVisible({ timeout: 30000 });

    await page.getByText(description).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Description').clear();
    await page.getByLabel('Description').fill(updatedDescription);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText(updatedDescription).first()).toBeVisible({ timeout: 30000 });
  });

  test('should delete a leave day', async ({ page }) => {
    await selectPerson(page, TEST_PERSON);

    const timestamp = Date.now();
    const description = `DeleteHoliday-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Description').fill(description);

    const fromDate = page.getByLabel('From', { exact: true });
    await fromDate.click();
    await fromDate.fill('15-07-2040');
    await fromDate.press('Tab');
    await page.waitForTimeout(200);

    const toDate = page.getByLabel('To', { exact: true });
    await toDate.click();
    await toDate.fill('17-07-2040');
    await toDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(description).first()).toBeVisible({ timeout: 30000 });

    await page.getByText(description).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(
      page.getByText('Are you sure you want to remove this Leave Day?'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByText(description)).not.toBeVisible();
  });
});
