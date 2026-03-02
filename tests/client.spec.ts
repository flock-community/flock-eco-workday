import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const CLIENT_URL = '/clients';
const ADMIN_USERNAME = 'bert';

test.describe('Client CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(CLIENT_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should display existing clients', async ({ page }) => {
    await expect(page.getByText('Client A')).toBeVisible();
    await expect(page.getByText('Client B')).toBeVisible();
    await expect(page.getByText('Client C')).toBeVisible();
    await expect(page.getByText('Client D')).toBeVisible();
  });

  test('should create a new client', async ({ page }) => {
    const timestamp = Date.now();
    const clientName = `TestClient-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Client form')).toBeVisible();

    await page.getByLabel('Name').fill(clientName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Client form')).not.toBeVisible();

    await expect(page.getByText(clientName)).toBeVisible({ timeout: 30000 });
  });

  test('should update an existing client', async ({ page }) => {
    const timestamp = Date.now();
    const clientName = `EditClient-${timestamp}`;
    const updatedName = `UpdatedClient-${timestamp}`;

    // Create a client first
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Client form')).toBeVisible();
    await page.getByLabel('Name').fill(clientName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Client form')).not.toBeVisible();
    await expect(page.getByText(clientName)).toBeVisible({ timeout: 30000 });

    // Click the client to edit
    await page.getByText(clientName).click();
    await expect(page.getByText('Client form')).toBeVisible();

    // Update name
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Client form')).not.toBeVisible();

    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 30000 });
  });

  test('should delete a client', async ({ page }) => {
    const timestamp = Date.now();
    const clientName = `DeleteClient-${timestamp}`;

    // Create a client first
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Client form')).toBeVisible();
    await page.getByLabel('Name').fill(clientName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Client form')).not.toBeVisible();
    await expect(page.getByText(clientName)).toBeVisible({ timeout: 30000 });

    // Click the client to open edit dialog
    await page.getByText(clientName).click();
    await expect(page.getByText('Client form')).toBeVisible();

    // Delete
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion
    const confirmDialog = page.getByRole('dialog', { name: 'Confirm' });
    await expect(
      confirmDialog.getByText('Are you sure you would like to delete client:'),
    ).toBeVisible();
    await confirmDialog.getByRole('button', { name: 'Confirm' }).click();

    // Verify gone
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: clientName })).not.toBeVisible();
  });
});
