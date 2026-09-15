import { expect, type Page, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const PERSON_URL = '/person';
const ADMIN_USERNAME = 'bert';

// PersonWidget renders MUI IconButtons with no aria-label, only icons.
// MUI tags imported icons with data-testid="<IconName>", so we can find
// the edit/delete icon buttons reliably via the SVG inside them.
const EDIT_BUTTON = 'button:has(svg[data-testid="CreateIcon"])';
const DELETE_BUTTON = 'button:has(svg[data-testid="DeleteRoundedIcon"])';

type AddressData = {
  street: string;
  houseNumber: string;
  houseNumberAddition: string;
  postalCode: string;
  city: string;
};

type PersonData = {
  firstname: string;
  lastname: string;
  email: string;
  number: string;
  address: AddressData;
};

function buildPersonData(suffix: string): PersonData {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    firstname: `E2EUser${stamp}`,
    lastname: `${suffix}${stamp.slice(-4)}`,
    email: `e2e.${suffix.toLowerCase()}.${stamp}@example.com`,
    number: stamp.slice(-5),
    address: {
      street: `Teststraat${stamp.slice(-4)}`,
      houseNumber: '12',
      houseNumberAddition: 'A',
      // Entered without a space and in lower case: the backend normalises it to "1234 AB"
      postalCode: '1234ab',
      city: 'Hilversum',
    },
  };
}

async function fillAddress(page: Page, address: AddressData) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Street' }).fill(address.street);
  // "House number" is a prefix of no other label, but keep the match exact so a
  // future "House number addition" label cannot make this ambiguous.
  await dialog
    .getByRole('textbox', { name: 'House number', exact: true })
    .fill(address.houseNumber);
  await dialog
    .getByRole('textbox', { name: 'Addition' })
    .fill(address.houseNumberAddition);
  await dialog
    .getByRole('textbox', { name: 'Postal code' })
    .fill(address.postalCode);
  await dialog.getByRole('textbox', { name: 'City' }).fill(address.city);
}

async function fillPersonForm(page: Page, data: PersonData) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'firstname' }).fill(data.firstname);
  await dialog.getByRole('textbox', { name: 'lastname' }).fill(data.lastname);
  await dialog.getByRole('textbox', { name: 'email' }).fill(data.email);
  // Exact: "number" is also a substring of the "House number" address field
  await dialog
    .getByRole('textbox', { name: 'number', exact: true })
    .fill(data.number);
  await fillAddress(page, data.address);
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
    // The Dutch address is shown on two lines, with the postal code normalised
    // to "1234 AB" and the single-letter addition glued to the house number
    await expect(
      page.getByText(`${data.address.street} 12A`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('1234 AB Hilversum', { exact: true }),
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
    // The stored address is pre-filled in the edit dialog
    await expect(dialog.getByRole('textbox', { name: 'Street' })).toHaveValue(
      original.address.street,
    );
    await expect(
      dialog.getByRole('textbox', { name: 'Postal code' }),
    ).toHaveValue('1234 AB');
    await dialog
      .getByRole('textbox', { name: 'firstname' })
      .fill(updatedFirstname);
    await dialog.getByRole('textbox', { name: 'email' }).fill(updatedEmail);
    await dialog.getByRole('textbox', { name: 'City' }).fill('Amsterdam');
    await saveDialog(page);

    // Details page reloads with new values in the PersonWidget
    await expect(
      page.getByText(`${updatedFirstname} ${original.lastname}`).first(),
    ).toBeVisible();
    await expect(page.getByText(updatedEmail)).toBeVisible();
    await expect(
      page.getByText('1234 AB Amsterdam', { exact: true }),
    ).toBeVisible();

    // And the list reflects them too
    await page.goto(PERSON_URL);
    await searchPerson(page, `${updatedFirstname} ${original.lastname}`);
    await expect(page.getByText(updatedEmail)).toBeVisible();
  });

  test('shows the associated user in the form when editing a person', async ({
    page,
  }) => {
    // The seeded worker "Tommy Dog" is linked to the seeded "Tommy" user
    // (see the mock LoadPersonData / Users data). Opening the edit dialog must
    // pre-populate the user selector with that user.
    const linked = {
      firstname: 'Tommy',
      lastname: 'Dog',
      email: 'tommy@sesam.straat',
      number: '',
    };
    await openPersonDetails(page, linked);

    await page.locator(EDIT_BUTTON).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByText('Create Person')).toBeVisible();

    // The user selector renders the linked user as "<name> <<email>>". The
    // email only appears as visible text inside the selector (the email field
    // is an <input>, whose value getByText does not match), so this asserts
    // the associated user is shown rather than an empty "None" selector.
    await expect(dialog.getByText(linked.email).first()).toBeVisible();
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

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Cancel' })
      .click();
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

  test('blocks submission when the address is incomplete', async ({ page }) => {
    const data = buildPersonData('Address');

    await openCreateDialog(page);
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('textbox', { name: 'firstname' })
      .fill(data.firstname);
    await dialog.getByRole('textbox', { name: 'lastname' }).fill(data.lastname);
    // Only a street: the other address fields are now required
    await dialog
      .getByRole('textbox', { name: 'Street' })
      .fill(data.address.street);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText('House number is required when an address is given'),
    ).toBeVisible();
    await expect(
      dialog.getByText('Postal code is required when an address is given'),
    ).toBeVisible();
    await expect(
      dialog.getByText('City is required when an address is given'),
    ).toBeVisible();

    // A non-Dutch postal code is rejected as well
    await fillAddress(page, { ...data.address, postalCode: 'SW1A 1AA' });
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText('Use a Dutch postal code such as 1234 AB'),
    ).toBeVisible();
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
