import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const ASSIGNMENT_URL = '/assignments';
const ADMIN_USERNAME = 'bert';

test.describe('Assignment CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(ASSIGNMENT_URL);
    await page.waitForLoadState('networkidle');
  });

  async function selectPerson(page, personName: string) {
    const personSelect = page.getByRole('combobox');
    await personSelect.click();
    await page.getByRole('option', { name: personName }).click();
    await page.waitForLoadState('networkidle');
  }

  async function selectClient(page, clientName: string) {
    const clientSelect = page
      .getByRole('dialog')
      .getByRole('combobox')
      .first();
    await clientSelect.click();
    await page.getByRole('option', { name: clientName }).click();
  }

  test('should display assignments for a selected person', async ({
    page,
  }) => {
    // Select Tommy who has an existing assignment
    await selectPerson(page, 'Tommy Dog');

    // Verify the Assignments card is visible
    await expect(page.getByText('Assignments')).toBeVisible();

    // Tommy has a "DevOps engineer" assignment with Client A
    await expect(page.getByText('Client A - DevOps engineer')).toBeVisible();
  });

  test('should create a new assignment', async ({ page }) => {
    // Select Bert who is the admin user
    await selectPerson(page, 'Bert Muppets');

    // Click Add button to open assignment dialog
    await page.getByRole('button', { name: 'Add' }).click();

    // Verify dialog is open
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).toBeVisible();

    // Fill in assignment details
    await page.getByLabel('Hourly rate').clear();
    await page.getByLabel('Hourly rate').fill('120');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('40');

    await page.getByLabel('Role').fill('Test automation engineer');

    // Set start date
    const startDate = page.getByLabel('Start date');
    await startDate.click();
    await startDate.fill('01-01-2026');
    await startDate.press('Tab');
    await page.waitForTimeout(200);

    // Set end date
    const endDate = page.getByLabel('End date');
    await endDate.click();
    await endDate.fill('31-12-2026');
    await endDate.press('Tab');
    await page.waitForTimeout(200);

    // Select client
    await selectClient(page, 'Client B');

    // Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for dialog to close
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    // Verify the new assignment appears in the list
    await expect(
      page.getByRole('heading', { name: 'Client B - Test automation engineer' }).first(),
    ).toBeVisible();
    await expect(page.getByText('Hourly rate: 120').first()).toBeVisible();
    await expect(page.getByText('Hours per week: 40').first()).toBeVisible();
  });

  test('should edit an existing assignment', async ({ page }) => {
    // Select Bert who has an existing assignment with Client C
    await selectPerson(page, 'Bert Muppets');

    // Client C might be on page 2 if other tests created assignments
    const clientCHeading = page.getByRole('heading', { name: /Client C -/ });
    if ((await clientCHeading.count()) === 0) {
      const nextPage = page.getByRole('button', { name: 'Go to next page' });
      if (await nextPage.isEnabled()) {
        await nextPage.click();
        await page.waitForLoadState('networkidle');
      }
    }
    await clientCHeading.click();

    // Verify dialog is open in edit mode
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).toBeVisible();

    // Verify the Delete button is visible (only in edit mode)
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Update the role
    await page.getByLabel('Role').clear();
    await page.getByLabel('Role').fill('Senior software engineer');

    // Update hourly rate
    await page.getByLabel('Hourly rate').clear();
    await page.getByLabel('Hourly rate').fill('110');

    // Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for dialog to close
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    // Verify updated assignment in the list
    await expect(
      page.getByRole('heading', { name: 'Client C - Senior software engineer' }).first(),
    ).toBeVisible();
    await expect(page.getByText('Hourly rate: 110').first()).toBeVisible();
  });

  test('should delete an assignment', async ({ page }) => {
    // First create an assignment to delete
    await selectPerson(page, 'Bert Muppets');

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).toBeVisible();

    await page.getByLabel('Hourly rate').clear();
    await page.getByLabel('Hourly rate').fill('75');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('24');

    await page.getByLabel('Role').fill('Temporary contractor');

    const startDate = page.getByLabel('Start date');
    await startDate.click();
    await startDate.fill('01-06-2026');
    await startDate.press('Tab');
    await page.waitForTimeout(200);

    await selectClient(page, 'Client D');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    // Verify the assignment was created
    await expect(
      page.getByRole('heading', { name: 'Client D - Temporary contractor' }).first(),
    ).toBeVisible();

    // Click the assignment to open edit dialog
    await page.getByRole('heading', { name: 'Client D - Temporary contractor' }).first().click();
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).toBeVisible();

    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Verify confirmation dialog appears
    await expect(page.getByRole('heading', { name: 'Confirm' })).toBeVisible();
    await expect(
      page.getByText('Are you sure you would like to delete assignment'),
    ).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Wait for dialogs to close
    await page.waitForLoadState('networkidle');

    // Verify the deleted assignment is gone (use heading role to avoid matching other text)
    await expect(
      page.getByRole('heading', { name: 'Client D - Temporary contractor' }),
    ).toHaveCount(0);
  });

  test('should cancel creating an assignment', async ({ page }) => {
    await selectPerson(page, 'Bert Muppets');

    // Open dialog
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).toBeVisible();

    // Fill some data
    await page.getByLabel('Role').fill('Should not be saved');

    // Close dialog by clicking the close button (X)
    await page.getByRole('dialog').press('Escape');

    // Verify dialog is closed
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    // Verify the assignment was not created
    await expect(page.getByText('Should not be saved')).not.toBeVisible();
  });
});
