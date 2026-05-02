import { expect, type Page, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const PERSON_URL = '/person';
const ADMIN_USERNAME = 'bert';

// PersonWidget renders MUI IconButtons with no aria-label, only icons.
// MUI tags imported icons with data-testid="<IconName>", so we can find
// the edit/delete icon buttons reliably via the SVG inside them.
const EDIT_BUTTON = 'button:has(svg[data-testid="CreateIcon"])';
const DELETE_BUTTON = 'button:has(svg[data-testid="DeleteRoundedIcon"])';

type PersonData = {
  firstname: string;
  lastname: string;
  email: string;
  number: string;
};

function buildPersonData(suffix: string): PersonData {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    firstname: `E2EUser${stamp}`,
    lastname: `${suffix}${stamp.slice(-4)}`,
    email: `e2e.${suffix.toLowerCase()}.${stamp}@example.com`,
    number: stamp.slice(-5),
  };
}

async function fillPersonForm(page: Page, data: PersonData) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'firstname' }).fill(data.firstname);
  await dialog.getByRole('textbox', { name: 'lastname' }).fill(data.lastname);
  await dialog.getByRole('textbox', { name: 'email' }).fill(data.email);
  await dialog.getByRole('textbox', { name: 'number' }).fill(data.number);
}

async function openCreateDialog(page: Page) {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Create Person')).toBeVisible();
}

async function saveDialog(page: Page) {
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

async function searchPerson(page: Page, fullName: string) {
  const search = page.getByPlaceholder('Search name');
  await search.fill('');
  await search.fill(fullName);
  // Search has a 350ms debounce in PersonTable
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('link', { name: fullName, exact: true }),
  ).toBeVisible();
}

async function createPerson(page: Page, data: PersonData) {
  await openCreateDialog(page);
  await fillPersonForm(page, data);
  await saveDialog(page);
}

async function openPersonDetails(page: Page, data: PersonData) {
  const fullName = `${data.firstname} ${data.lastname}`;
  await searchPerson(page, fullName);
  await page.getByRole('link', { name: fullName, exact: true }).click();
  await page.waitForURL(/.*\/person\/code\/.*/);
  // PersonWidget shows the fullName in the CardHeader title
  await expect(page.getByText(fullName, { exact: true }).first()).toBeVisible();
}

test.describe('Person flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(PERSON_URL);
    await expect(page.getByText('Persons').last()).toBeVisible();
  });

  test('creates a new person and shows them in the list', async ({ page }) => {
    const data = buildPersonData('Create');

    await openCreateDialog(page);
    await fillPersonForm(page, data);
    await page.getByRole('checkbox', { name: 'Reminders' }).check();
    await saveDialog(page);

    const fullName = `${data.firstname} ${data.lastname}`;
    await searchPerson(page, fullName);
    await expect(
      page.getByRole('link', { name: fullName, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(data.email)).toBeVisible();
  });

  test('shows person details after navigating from the list', async ({
    page,
  }) => {
    const data = buildPersonData('View');
    await createPerson(page, data);
    await openPersonDetails(page, data);

    // PersonWidget renders a details table with the firstname/lastname/email
    // values in their own cells
    await expect(
      page.getByRole('cell', { name: data.firstname, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: data.lastname, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: data.email, exact: true }),
    ).toBeVisible();
    // New persons default to active = true
    await expect(page.getByRole('cell', { name: 'Yes' }).first()).toBeVisible();
  });

  test('edits an existing person and persists the changes', async ({
    page,
  }) => {
    const original = buildPersonData('Edit');
    await createPerson(page, original);
    await openPersonDetails(page, original);

    await page.locator(EDIT_BUTTON).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create Person')).toBeVisible();

    const updatedFirstname = `Updated${original.firstname}`;
    const updatedEmail = `updated.${original.email}`;
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'firstname' }).fill(updatedFirstname);
    await dialog.getByRole('textbox', { name: 'email' }).fill(updatedEmail);
    await saveDialog(page);

    // Details page reloads with new values in the PersonWidget
    await expect(
      page.getByText(`${updatedFirstname} ${original.lastname}`).first(),
    ).toBeVisible();
    await expect(page.getByText(updatedEmail)).toBeVisible();

    // And the list reflects them too
    await page.goto(PERSON_URL);
    await searchPerson(page, `${updatedFirstname} ${original.lastname}`);
    await expect(page.getByText(updatedEmail)).toBeVisible();
  });

  test('deletes a person via the confirmation dialog', async ({ page }) => {
    const data = buildPersonData('Delete');
    await createPerson(page, data);
    await openPersonDetails(page, data);

    await page.locator(DELETE_BUTTON).first().click();

    // ConfirmDialog opens with a "Confirm" title and the deletion question
    await expect(
      page.getByRole('heading', { name: 'Confirm', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        `Surely you cant be serious? Delete ${data.firstname} ${data.lastname}`,
      ),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForURL(`**${PERSON_URL}`);

    const fullName = `${data.firstname} ${data.lastname}`;
    await page.getByPlaceholder('Search name').fill(fullName);
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('link', { name: fullName, exact: true }),
    ).toHaveCount(0);
  });

  test('cancels the create dialog without persisting the person', async ({
    page,
  }) => {
    const data = buildPersonData('Cancel');

    await openCreateDialog(page);
    await fillPersonForm(page, data);

    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    const fullName = `${data.firstname} ${data.lastname}`;
    await page.getByPlaceholder('Search name').fill(fullName);
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('link', { name: fullName, exact: true }),
    ).toHaveCount(0);
  });

  test('blocks submission when required fields are missing', async ({
    page,
  }) => {
    await openCreateDialog(page);

    const dialog = page.getByRole('dialog');
    // Submit empty: schema marks firstname & lastname as required
    await dialog.getByRole('button', { name: 'Save' }).click();

    // Dialog stays open because validation prevents submit
    await expect(dialog).toBeVisible();
    await expect(page.getByText('Create Person')).toBeVisible();
  });

  test('cancels the delete confirmation and keeps the person', async ({
    page,
  }) => {
    const data = buildPersonData('KeepAfterCancel');
    await createPerson(page, data);
    await openPersonDetails(page, data);

    await page.locator(DELETE_BUTTON).first().click();
    await expect(
      page.getByRole('heading', { name: 'Confirm', exact: true }),
    ).toBeVisible();

    // Cancel the confirm dialog (the second Cancel button - inside ConfirmDialog)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Cancel' })
      .click();

    // Still on the details page
    await expect(page).toHaveURL(/.*\/person\/code\/.*/);
    await expect(
      page
        .getByText(`${data.firstname} ${data.lastname}`, { exact: true })
        .first(),
    ).toBeVisible();

    // And the person is still searchable in the list
    await page.goto(PERSON_URL);
    await searchPerson(page, `${data.firstname} ${data.lastname}`);
  });

  test('search filters the person list to the matching entry', async ({
    page,
  }) => {
    const data = buildPersonData('Search');
    await createPerson(page, data);

    const fullName = `${data.firstname} ${data.lastname}`;
    const search = page.getByPlaceholder('Search name');

    await search.fill(data.firstname);
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('link', { name: fullName, exact: true }),
    ).toBeVisible();

    await search.fill('');
    await search.fill('definitely-not-a-real-person-xyz');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('link', { name: fullName, exact: true }),
    ).toHaveCount(0);
  });
});
