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

  async function openCreateDialog(page) {
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create a project')).toBeVisible();
  }

  async function openEditDialogFor(page, projectName: string) {
    const row = page.getByRole('row', { name: new RegExp(projectName) });
    await row.getByRole('button').last().click();
    await expect(page.getByText('Create a project')).toBeVisible();
  }

  test('should display the seeded project list', async ({ page }) => {
    await expect(page.getByText('Projects')).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Empty project' }),
    ).toBeVisible();
  });

  test('should create a new project', async ({ page }) => {
    const projectName = `E2E created project ${Date.now()}`;

    await openCreateDialog(page);

    await page.getByLabel('Name').fill(projectName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Create a project')).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('cell', { name: projectName })).toBeVisible();
  });

  test('should edit an existing project', async ({ page }) => {
    const originalName = `E2E editable project ${Date.now()}`;
    const updatedName = `${originalName} (renamed)`;

    // Seed a project we own so the test does not depend on other tests
    await openCreateDialog(page);
    await page.getByLabel('Name').fill(originalName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create a project')).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    await openEditDialogFor(page, originalName);

    const nameField = page.getByLabel('Name');
    await nameField.clear();
    await nameField.fill(updatedName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Create a project')).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('cell', { name: updatedName })).toBeVisible();
    await expect(
      page.getByRole('cell', { name: originalName, exact: true }),
    ).toHaveCount(0);
  });

  test('should delete a project without assignments', async ({ page }) => {
    const projectName = `E2E deletable project ${Date.now()}`;

    // Seed a fresh project (no assignments => delete is enabled)
    await openCreateDialog(page);
    await page.getByLabel('Name').fill(projectName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create a project')).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    await openEditDialogFor(page, projectName);

    // The Delete button is only visible when there are no assignments
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Create a project')).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('cell', { name: projectName, exact: true }),
    ).toHaveCount(0);
  });

  test('should disable delete for a project that has assignments', async ({
    page,
  }) => {
    // "Project D" is seeded with assignments via LoadAssignmentData
    await openEditDialogFor(page, 'Project D');

    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
    await expect(
      page.getByText(
        'This project cannot be deleted because it contains assignments',
      ),
    ).toBeVisible();
  });

  test('should cancel creating a project', async ({ page }) => {
    const projectName = `Should not be saved ${Date.now()}`;

    await openCreateDialog(page);
    await page.getByLabel('Name').fill(projectName);

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByText('Create a project')).not.toBeVisible();
    await expect(
      page.getByRole('cell', { name: projectName, exact: true }),
    ).toHaveCount(0);
  });
});
