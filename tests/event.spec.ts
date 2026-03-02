import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const EVENT_URL = '/event';
const ADMIN_USERNAME = 'bert';

test.describe('Event CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(EVENT_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should display existing events', async ({ page }) => {
    await expect(page.getByText('Events', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });

  test('should create a new event', async ({ page }) => {
    const timestamp = Date.now();
    const description = `TestEvent-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Description').fill(description);

    await page.getByLabel('Costs').clear();
    await page.getByLabel('Costs').fill('100');

    const fromDate = page.getByLabel('From', { exact: true });
    await fromDate.click();
    await fromDate.fill('01-09-2027');
    await fromDate.press('Tab');
    await page.waitForTimeout(200);

    const toDate = page.getByLabel('To', { exact: true });
    await toDate.click();
    await toDate.fill('01-09-2027');
    await toDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByText(description).first()).toBeVisible({ timeout: 30000 });
  });

  test('should update an existing event', async ({ page }) => {
    const timestamp = Date.now();
    const description = `EditEvent-${timestamp}`;
    const updatedDescription = `UpdatedEvent-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Description').fill(description);
    await page.getByLabel('Costs').clear();
    await page.getByLabel('Costs').fill('50');

    const fromDate = page.getByLabel('From', { exact: true });
    await fromDate.click();
    await fromDate.fill('10-09-2027');
    await fromDate.press('Tab');
    await page.waitForTimeout(200);

    const toDate = page.getByLabel('To', { exact: true });
    await toDate.click();
    await toDate.fill('10-09-2027');
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

  test('should delete an event', async ({ page }) => {
    const timestamp = Date.now();
    const description = `DeleteEvent-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Description').fill(description);
    await page.getByLabel('Costs').clear();
    await page.getByLabel('Costs').fill('75');

    const fromDate = page.getByLabel('From', { exact: true });
    await fromDate.click();
    await fromDate.fill('15-09-2027');
    await fromDate.press('Tab');
    await page.waitForTimeout(200);

    const toDate = page.getByLabel('To', { exact: true });
    await toDate.click();
    await toDate.fill('15-09-2027');
    await toDate.press('Tab');
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(description).first()).toBeVisible({ timeout: 30000 });

    await page.getByText(description).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(
      page.getByText('Are you sure you want to remove this event?'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByText(description)).not.toBeVisible();
  });
});
