import { expect, type Page, test } from '@playwright/test';
import {
  Given_I_am_logged_in_as_user,
  selectDateInPicker,
} from './steps/workdaySteps';

const LAPTOP_URL = '/laptops';
const ADMIN_USERNAME = 'bert';

type LaptopData = {
  name: string;
  serialNumber: string;
};

// The list is sorted by name; "Test laptop ..." sorts after the seeded MacBooks so
// laptops left behind by earlier runs never push those off the first page.
function buildLaptopData(suffix: string): LaptopData {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    name: `Test laptop ${suffix} ${stamp}`,
    serialNumber: `E2E-${suffix.toUpperCase()}-${stamp}`,
  };
}

function laptopRow(page: Page, name: string) {
  return page.locator('table tbody tr').filter({ hasText: name }).first();
}

async function openCreateDialog(page: Page) {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Register a laptop')).toBeVisible();
}

async function openEditDialog(page: Page, name: string) {
  await laptopRow(page, name).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Edit laptop')).toBeVisible();
}

async function fillLaptopForm(page: Page, data: LaptopData) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Name' }).fill(data.name);
  await dialog
    .getByRole('textbox', { name: 'Serial number' })
    .fill(data.serialNumber);
}

async function selectPerson(page: Page, personName: string) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Person' }).click();
  await page.getByRole('option', { name: personName }).click();
}

async function saveDialog(page: Page) {
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

async function createLaptop(page: Page, data: LaptopData) {
  await openCreateDialog(page);
  await fillLaptopForm(page, data);
  await saveDialog(page);
  await expect(laptopRow(page, data.name)).toBeVisible({ timeout: 30000 });
}

test.describe('Laptop registration', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(LAPTOP_URL);
    await expect(page.getByRole('heading', { name: 'Laptops' })).toBeVisible();
    await page.waitForLoadState('networkidle');
  });

  test('shows the seeded laptops with who has them and the contract state', async ({
    page,
  }) => {
    const tommysLaptop = laptopRow(page, 'MacBook Pro 16 (2023)');
    await expect(tommysLaptop).toBeVisible();
    await expect(tommysLaptop).toContainText('C02XK1ABCD01');
    await expect(tommysLaptop).toContainText('14-11-2023');
    await expect(tommysLaptop).toContainText('Tommy Dog');
    await expect(tommysLaptop).toContainText('Signed');

    const pinosLaptop = laptopRow(page, 'MacBook Air 13 (2024)');
    await expect(pinosLaptop).toContainText('Pino Woodpecker');
    await expect(pinosLaptop).toContainText('Not signed');

    const spare = laptopRow(page, 'MacBook Pro 14 (2022) spare');
    await expect(spare).toContainText('Unknown');
    await expect(spare).toContainText('Unassigned');
  });

  test('registers a laptop for a person with a signed contract', async ({
    page,
  }) => {
    const data = buildLaptopData('Create');

    await openCreateDialog(page);
    await fillLaptopForm(page, data);
    await selectDateInPicker(page, 'Purchase date', 3, 5, 2024);
    await selectPerson(page, 'Ernie Muppets');
    await page.getByRole('checkbox', { name: 'Contract signed' }).check();
    await saveDialog(page);

    const row = laptopRow(page, data.name);
    await expect(row).toBeVisible({ timeout: 30000 });
    await expect(row).toContainText(data.serialNumber);
    await expect(row).toContainText('03-05-2024');
    await expect(row).toContainText('Ernie Muppets');
    await expect(row).toContainText('Signed');

    // The edit dialog is pre-filled with the purchase date
    await openEditDialog(page, data.name);
    await expect(
      page.getByRole('dialog').getByLabel('Purchase date', { exact: true }),
    ).toHaveValue('03-05-2024');
  });

  test('registers a laptop that nobody has yet', async ({ page }) => {
    const data = buildLaptopData('Spare');

    await createLaptop(page, data);

    const row = laptopRow(page, data.name);
    await expect(row).toContainText('Unknown');
    await expect(row).toContainText('Unassigned');
    await expect(row).toContainText('Not signed');
  });

  test('edits a laptop: hands it out and signs the contract', async ({
    page,
  }) => {
    const data = buildLaptopData('Edit');
    await createLaptop(page, data);

    await openEditDialog(page, data.name);
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toHaveValue(
      data.name,
    );
    await expect(
      dialog.getByRole('textbox', { name: 'Serial number' }),
    ).toHaveValue(data.serialNumber);

    const updatedName = `${data.name} (renamed)`;
    await dialog.getByRole('textbox', { name: 'Name' }).fill(updatedName);
    await selectPerson(page, 'Tommy Dog');
    await page.getByRole('checkbox', { name: 'Contract signed' }).check();
    await saveDialog(page);

    const row = laptopRow(page, updatedName);
    await expect(row).toBeVisible({ timeout: 30000 });
    await expect(row).toContainText('Tommy Dog');
    await expect(row).toContainText('Signed');

    // The edit dialog is pre-filled with the person that has the laptop
    await openEditDialog(page, updatedName);
    await expect(
      page.getByRole('dialog').getByRole('combobox', { name: 'Person' }),
    ).toHaveValue('Tommy Dog');
    await expect(
      page.getByRole('checkbox', { name: 'Contract signed' }),
    ).toBeChecked();
  });

  test('deletes a laptop via the confirmation dialog', async ({ page }) => {
    const data = buildLaptopData('Delete');
    await createLaptop(page, data);

    await openEditDialog(page, data.name);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Confirm', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        `Are you sure you would like to delete laptop '${data.name}'?`,
      ),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Both the confirmation and the edit dialog close
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(laptopRow(page, data.name)).toHaveCount(0);
  });

  test('blocks submission when the name or serial number is missing', async ({
    page,
  }) => {
    await openCreateDialog(page);

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Name is required')).toBeVisible();
    await expect(dialog.getByText('Serial number is required')).toBeVisible();
  });

  test('refuses a serial number that is already registered', async ({
    page,
  }) => {
    const data = buildLaptopData('Dup');
    await createLaptop(page, data);

    await openCreateDialog(page);
    await fillLaptopForm(page, {
      name: `${data.name} copy`,
      serialNumber: data.serialNumber.toLowerCase(),
    });
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(
        `A laptop with serial number '${data.serialNumber.toLowerCase()}' is already registered`,
      ),
    ).toBeVisible();
  });

  test('cancels the create dialog without registering the laptop', async ({
    page,
  }) => {
    const data = buildLaptopData('Cancel');

    await openCreateDialog(page);
    await fillLaptopForm(page, data);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Cancel' })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.waitForLoadState('networkidle');

    await expect(laptopRow(page, data.name)).toHaveCount(0);
  });
});

// Regular workers have no laptop authority, so this is the only place they see their laptop.
test.describe('Laptops on the home page', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  function myLaptopRow(page: Page, name: string) {
    return page
      .getByTestId('laptops-card')
      .locator('table tbody tr')
      .filter({ hasText: name })
      .first();
  }

  test('a person sees their own laptop with the serial number and a signed contract', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, 'tommy');

    const card = page.getByTestId('laptops-card');
    await expect(card.getByText('Laptops', { exact: true })).toBeVisible();

    const row = myLaptopRow(page, 'MacBook Pro 16 (2023)');
    await expect(row).toBeVisible();
    await expect(row).toContainText('C02XK1ABCD01');
    await expect(row.getByText('Signed', { exact: true })).toBeVisible();

    // Laptops of other people are not theirs to see
    await expect(card).not.toContainText('MacBook Air 13 (2024)');
    await expect(card).not.toContainText('ThinkPad X1 Carbon');
  });

  test('a person sees when the contract for their laptop is not signed', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, 'pino');

    const row = myLaptopRow(page, 'MacBook Air 13 (2024)');
    await expect(row).toBeVisible();
    await expect(row).toContainText('C02XK1ABCD02');
    await expect(row.getByText('Not signed', { exact: true })).toBeVisible();
  });

  test('a person without a laptop is told so', async ({ page }) => {
    // Ieniemienie never gets a laptop, not in the seed data nor in the tests above
    await Given_I_am_logged_in_as_user(page, 'ieniemienie');

    await expect(
      page.getByTestId('laptops-card').getByText('No laptop assigned to you.'),
    ).toBeVisible();
  });
});
