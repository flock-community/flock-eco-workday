import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const PROJECT_URL = '/projects';
const ADMIN_USERNAME = 'bert';

test.describe('Project CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(PROJECT_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should display existing projects', async ({ page }) => {
    await expect(page.getByText('Empty project')).toBeVisible();
  });

  test('should create a new project', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `TestProject-${timestamp}`;

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create a project')).toBeVisible();

    await page.getByLabel('Name').fill(projectName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create a project')).not.toBeVisible();

    await expect(page.getByRole('cell', { name: projectName })).toBeVisible({ timeout: 30000 });
  });

  test('should update an existing project', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `EditProject-${timestamp}`;
    const updatedName = `UpdatedProject-${timestamp}`;

    // Create a project first
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create a project')).toBeVisible();
    await page.getByLabel('Name').fill(projectName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create a project')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: projectName })).toBeVisible({ timeout: 30000 });

    // Click the edit icon in the project's row
    const projectRow = page.getByRole('row', { name: projectName });
    await projectRow.getByRole('button').last().click();
    await expect(page.getByText('Create a project')).toBeVisible();

    // Update name
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create a project')).not.toBeVisible();

    await expect(page.getByRole('cell', { name: updatedName })).toBeVisible({ timeout: 30000 });
  });

  test('should delete a project', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `DeleteProject-${timestamp}`;

    // Create a project first
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create a project')).toBeVisible();
    await page.getByLabel('Name').fill(projectName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create a project')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: projectName })).toBeVisible({ timeout: 30000 });

    // Click the edit icon in the project's row
    const projectRow = page.getByRole('row', { name: projectName });
    await projectRow.getByRole('button').last().click();
    await expect(page.getByText('Create a project')).toBeVisible();

    // Delete
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForLoadState('networkidle');

    // Verify project is gone
    await expect(page.getByRole('cell', { name: projectName })).not.toBeVisible();
  });
});
