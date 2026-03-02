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
    const clientSelect = page.getByRole('dialog').getByRole('combobox').first();
    await clientSelect.click();
    await page.getByRole('option', { name: clientName }).click();
  }

  test('should display assignments for a selected person', async ({ page }) => {
    await selectPerson(page, 'Tommy Dog');

    await expect(page.getByText('Assignments')).toBeVisible();
    await expect(page.getByText('Client A - DevOps engineer')).toBeVisible();
  });

  test('should create a new assignment', async ({ page }) => {
    const timestamp = Date.now();
    const roleName = `CreateRole-${timestamp}`;

    await selectPerson(page, 'Ernie Muppets');

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create / Edit an assignment')).toBeVisible();

    await page.getByLabel('Hourly rate').clear();
    await page.getByLabel('Hourly rate').fill('120');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('40');

    await page.getByLabel('Role').fill(roleName);

    const startDate = page.getByLabel('Start date');
    await startDate.click();
    await startDate.fill('01-01-2026');
    await startDate.press('Tab');
    await page.waitForTimeout(200);

    const endDate = page.getByLabel('End date');
    await endDate.click();
    await endDate.fill('31-12-2026');
    await endDate.press('Tab');
    await page.waitForTimeout(200);

    await selectClient(page, 'Client B');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    await expect(
      page
        .getByRole('heading', { name: `Client B - ${roleName}` })
        .first(),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Hourly rate: 120').first()).toBeVisible();
    await expect(page.getByText('Hours per week: 40').first()).toBeVisible();
  });

  test('should edit an existing assignment', async ({ page }) => {
    const timestamp = Date.now();
    const roleName = `EditRole-${timestamp}`;
    const updatedRole = `UpdatedRole-${timestamp}`;

    await selectPerson(page, 'Bert Muppets');

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create / Edit an assignment')).toBeVisible();

    await page.getByLabel('Hourly rate').clear();
    await page.getByLabel('Hourly rate').fill('95');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('32');

    await page.getByLabel('Role').fill(roleName);

    const startDate = page.getByLabel('Start date');
    await startDate.click();
    await startDate.fill('01-01-2027');
    await startDate.press('Tab');
    await page.waitForTimeout(200);

    await selectClient(page, 'Client A');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    await expect(
      page.getByRole('heading', { name: `Client A - ${roleName}` }).first(),
    ).toBeVisible({ timeout: 30000 });

    await page
      .getByRole('heading', { name: `Client A - ${roleName}` })
      .first()
      .click();

    await expect(page.getByText('Create / Edit an assignment')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

    await page.getByLabel('Role').clear();
    await page.getByLabel('Role').fill(updatedRole);

    await page.getByLabel('Hourly rate').clear();
    await page.getByLabel('Hourly rate').fill('110');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    await expect(
      page
        .getByRole('heading', { name: `Client A - ${updatedRole}` })
        .first(),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Hourly rate: 110').first()).toBeVisible();
  });

  test('should delete an assignment', async ({ page }) => {
    const timestamp = Date.now();
    const roleName = `DeleteRole-${timestamp}`;

    await selectPerson(page, 'Tommy Dog');

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create / Edit an assignment')).toBeVisible();

    await page.getByLabel('Hourly rate').clear();
    await page.getByLabel('Hourly rate').fill('75');

    await page.getByLabel('Hours per week').clear();
    await page.getByLabel('Hours per week').fill('24');

    await page.getByLabel('Role').fill(roleName);

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

    await expect(
      page
        .getByRole('heading', { name: `Client D - ${roleName}` })
        .first(),
    ).toBeVisible({ timeout: 30000 });

    await page
      .getByRole('heading', { name: `Client D - ${roleName}` })
      .first()
      .click();
    await expect(page.getByText('Create / Edit an assignment')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByRole('heading', { name: 'Confirm' })).toBeVisible();
    await expect(
      page.getByText('Are you sure you would like to delete assignment'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: `Client D - ${roleName}` }),
    ).toHaveCount(0);
  });

  test('should cancel creating an assignment', async ({ page }) => {
    await selectPerson(page, 'Bert Muppets');

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create / Edit an assignment')).toBeVisible();

    await page.getByLabel('Role').fill('Should not be saved');

    await page.getByRole('dialog').press('Escape');

    await expect(
      page.getByText('Create / Edit an assignment'),
    ).not.toBeVisible();

    await expect(page.getByText('Should not be saved')).not.toBeVisible();
  });
});
