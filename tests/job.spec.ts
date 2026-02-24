import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const BASE_URL = 'http://localhost:3000';
const JOB_URL = `${BASE_URL}/jobs`;
const ADMIN_USERNAME = 'bert';

test.describe('Job CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(JOB_URL);
    await expect(page.getByText('Jobs').first()).toBeVisible();
  });

  test('should create a new job successfully', async ({ page }) => {
    const timestamp = Date.now();
    const testJob = {
      title: `Test Job ${timestamp}`,
      description: `Description for test job ${timestamp}`,
      hourlyRate: '95',
      hoursPerWeek: '32',
    };

    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();

    // Verify dialog opened
    await expect(page.getByText('Job form')).toBeVisible();

    // Fill in the form fields
    await page.getByRole('textbox', { name: 'Title' }).fill(testJob.title);
    await page
      .getByRole('textbox', { name: 'Description' })
      .fill(testJob.description);
    await page
      .getByRole('textbox', { name: 'Hourly rate' })
      .fill(testJob.hourlyRate);
    await page
      .getByRole('textbox', { name: 'Hours per week' })
      .fill(testJob.hoursPerWeek);

    // Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify dialog closed
    await expect(page.getByText('Job form')).not.toBeVisible();

    // Verify job appears in the list
    await expect(page.getByText(testJob.title)).toBeVisible();
  });

  test('should create a job with client and status', async ({ page }) => {
    const timestamp = Date.now();
    const testJob = {
      title: `Client Job ${timestamp}`,
      description: `Job with client ${timestamp}`,
    };

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Job form')).toBeVisible();

    // Fill required fields
    await page.getByRole('textbox', { name: 'Title' }).fill(testJob.title);
    await page
      .getByRole('textbox', { name: 'Description' })
      .fill(testJob.description);

    // Select status "Open"
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Open' }).click();

    // Select a client
    await page.getByLabel('Select Client').click();
    await page.getByRole('option', { name: 'Client A' }).click();

    // Save
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Job form')).not.toBeVisible();

    // Verify job shows in list with client name and status
    await expect(page.getByText(testJob.title)).toBeVisible();
    await expect(page.getByText('Client A')).toBeVisible();
    await expect(page.getByText('OPEN')).toBeVisible();
  });

  test('should edit an existing job', async ({ page }) => {
    const timestamp = Date.now();
    const originalJob = {
      title: `Edit Job ${timestamp}`,
      description: `Original description ${timestamp}`,
      hourlyRate: '80',
    };

    // Create job first
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Job form')).toBeVisible();
    await page.getByRole('textbox', { name: 'Title' }).fill(originalJob.title);
    await page
      .getByRole('textbox', { name: 'Description' })
      .fill(originalJob.description);
    await page
      .getByRole('textbox', { name: 'Hourly rate' })
      .fill(originalJob.hourlyRate);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Job form')).not.toBeVisible();

    // Click on the job to open edit dialog
    await page.getByText(originalJob.title).click();
    await expect(page.getByText('Job form')).toBeVisible();

    // Update title and hourly rate
    const updatedTitle = `Updated Job ${timestamp}`;
    await page.getByRole('textbox', { name: 'Title' }).clear();
    await page.getByRole('textbox', { name: 'Title' }).fill(updatedTitle);
    await page.getByRole('textbox', { name: 'Hourly rate' }).clear();
    await page.getByRole('textbox', { name: 'Hourly rate' }).fill('120');

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Job form')).not.toBeVisible();

    // Verify updated job appears in list
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText('120/hr')).toBeVisible();
  });

  test('should delete a job', async ({ page }) => {
    const timestamp = Date.now();
    const testJob = {
      title: `Delete Job ${timestamp}`,
      description: `To be deleted ${timestamp}`,
    };

    // Create job first
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Job form')).toBeVisible();
    await page.getByRole('textbox', { name: 'Title' }).fill(testJob.title);
    await page
      .getByRole('textbox', { name: 'Description' })
      .fill(testJob.description);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Job form')).not.toBeVisible();

    // Verify job exists in list
    await expect(page.getByText(testJob.title)).toBeVisible();

    // Click on the job to open edit dialog
    await page.getByText(testJob.title).click();
    await expect(page.getByText('Job form')).toBeVisible();

    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Verify confirmation dialog
    await expect(page.getByText(testJob.title)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify dialog closed and job is removed from list
    await expect(page.getByText('Job form')).not.toBeVisible();
    await page.waitForTimeout(500);
    await expect(
      page.locator('.MuiCard-root').filter({ hasText: testJob.title }),
    ).not.toBeVisible();
  });

  test('should show job in navigation drawer', async ({ page }) => {
    // Open the drawer
    await page.getByRole('button', { name: 'menu' }).click();

    // Verify Jobs menu item is visible
    await expect(page.getByText('Jobs')).toBeVisible();
  });
});
