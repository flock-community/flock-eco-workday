import { expect, type Page, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const ADMIN_USERNAME = 'bert';
const WORKER_USERNAME = 'ernie';

/** Opens the CV page from the menu, like a user would. */
async function goToCv(page: Page) {
  await page.getByRole('link', { name: 'CV', exact: true }).click();
  await expect(page).toHaveURL(/\/cvs/);
  await page.waitForLoadState('networkidle');
}

async function selectPerson(page: Page, name: string) {
  await page.getByRole('combobox', { name: 'Select person' }).click();
  await page.getByRole('option', { name }).click();
  await page.waitForLoadState('networkidle');
}

/** The picker of the CV versions of the shown person. */
const versionPicker = (page: Page) =>
  page.getByRole('combobox', { name: 'CV' });

async function selectVersion(page: Page, name: string) {
  await versionPicker(page).click();
  await page.getByRole('option', { name: new RegExp(`^${name} ·`) }).click();
}

async function fillMonth(page: Page, label: string, month: string) {
  const input = page.getByLabel(label, { exact: true }).first();
  await input.click();
  await input.fill(month);
  await input.press('Tab');
}

async function deleteShownCv(page: Page) {
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirm' })
    .click();
  // Back on the CV page, which then links to the CV it shows, if any
  await expect(page).toHaveURL(/\/cvs(\/[^/?]+)?(\?|$)/);
  await page.waitForLoadState('networkidle');
}

test.describe('CV', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('a worker writes their own CV, keeps versions of it and restores an earlier one', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, WORKER_USERNAME);
    // CVs left behind by an earlier, failed run; a worker only gets their own
    const leftovers = await (await page.request.get('/api/cvs')).json();
    for (const cv of leftovers)
      await page.request.delete(`/api/cvs/${cv.code}`);

    await goToCv(page);
    // No person to pick: it is your own CV
    await expect(
      page.getByRole('combobox', { name: 'Select person' }),
    ).toHaveCount(0);
    await expect(page.getByTestId('cv-empty')).toContainText(
      'You have no CV yet',
    );

    await page.getByRole('link', { name: 'Write CV' }).click();
    await expect(
      page.getByRole('heading', { name: 'New CV of Ernie Muppets' }),
    ).toBeVisible();
    await page.getByRole('textbox', { name: 'Place' }).fill('Hilversum');
    await page
      .getByRole('textbox', { name: 'Profile' })
      .fill('Ernie is an engineer who likes rubber ducks.');

    // Save without a name or the required fields of an experience is refused in the form
    await page.getByRole('button', { name: 'Add experience' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Role is required')).toBeVisible();

    await page
      .getByRole('textbox', { name: 'Name of this version' })
      .fill('Algemeen');
    await fillMonth(page, 'From', '03-2021');
    await page.getByRole('textbox', { name: 'Role' }).fill('Backend engineer');
    await page.getByRole('textbox', { name: 'Client' }).fill('NS');
    await page.getByRole('textbox', { name: 'Via' }).fill('Flock');
    // Each technology becomes a chip: a comma or enter ends it
    const technologies = page.getByRole('combobox', { name: 'Technologies' });
    await technologies.pressSequentially('Kotlin,');
    await technologies.pressSequentially('Spring Boot');
    await technologies.press('Enter');
    await expect(
      page.getByTestId('cv-experience').locator('.MuiChip-label'),
    ).toHaveText(['Kotlin', 'Spring Boot']);
    await page
      .getByRole('textbox', { name: 'Description' })
      .fill('Ernie built the journey planner.');

    // A logo the shared collection does not have yet is added from here
    const logoName = `NS ${Date.now()}`;
    await page.getByRole('button', { name: 'Add logo' }).click();
    const logoDialog = page.getByRole('dialog');
    await expect(logoDialog.getByRole('textbox', { name: 'Name' })).toHaveValue(
      'NS',
    );
    await logoDialog.getByRole('textbox', { name: 'Name' }).fill(logoName);
    await logoDialog
      .getByLabel('Logo image')
      .setInputFiles('tests/files/timesheet.png');
    await logoDialog.getByRole('button', { name: 'Save' }).click();
    await expect(logoDialog).toBeHidden();
    await expect(page.getByRole('combobox', { name: 'Logo' })).toHaveValue(
      logoName,
    );
    await page.getByRole('button', { name: 'Save' }).click();

    // Back on the CV page, with the new CV
    const cv = page.getByRole('article');
    await expect(versionPicker(page)).toHaveText(/Algemeen · Dutch/);
    await expect(
      cv.getByRole('heading', { name: 'Curriculum Vitae - Ernie Muppets' }),
    ).toBeVisible();
    await expect(cv.getByRole('table')).toContainText('03-2021 - nu');
    await expect(cv.getByRole('table')).toContainText('NS (via Flock)');
    await expect(cv.getByText('Kotlin, Spring Boot')).toBeVisible();
    await expect(
      cv.getByRole('img', { name: `Logo ${logoName}` }),
    ).toBeVisible();

    // Edit: make it English and end the job
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await fillMonth(page, 'To', '12-2023');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(versionPicker(page)).toHaveText(/Algemeen · English/);
    await expect(cv.getByText('Work experience')).toBeVisible();
    await expect(cv.getByRole('table')).toContainText('03-2021 - 12-2023');
    await expect(cv.getByRole('table')).toContainText('34');

    // Compare the version before the edit with the current one
    await page.getByRole('button', { name: 'Compare versions' }).click();
    const compare = page.getByTestId('cv-compare');
    await expect(compare.locator('del', { hasText: 'Dutch' })).toBeVisible();
    await expect(compare.locator('ins', { hasText: 'English' })).toBeVisible();
    await expect(compare.locator('ins', { hasText: '12-2023' })).toBeVisible();
    await page.getByRole('button', { name: 'Side by side' }).click();
    await expect(compare.getByText('Dutch')).toBeVisible();
    await page.getByRole('button', { name: 'Close comparison' }).click();
    await expect(compare).toHaveCount(0);

    // The history has the version before the edit
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.getByRole('menuitem')).toHaveCount(2);
    await page.getByRole('menuitem').nth(1).click();
    await expect(
      page.getByText('You are looking at the version saved'),
    ).toBeVisible();
    await expect(cv.getByRole('table')).toContainText('03-2021 - nu');
    await expect(cv.getByText('Werkervaring')).toBeVisible();

    await page.getByRole('button', { name: 'Restore this version' }).click();
    await expect(
      page.getByText('You are looking at the version saved'),
    ).toHaveCount(0);
    await expect(versionPicker(page)).toHaveText(/Algemeen · Dutch/);
    await expect(cv.getByRole('table')).toContainText('03-2021 - nu');

    // A second version, starting as a copy of the first
    await page.getByRole('button', { name: 'New version' }).click();
    await page.getByRole('menuitem', { name: 'Copy of Algemeen' }).click();
    const name = page.getByRole('textbox', { name: 'Name of this version' });
    await expect(name).toHaveValue('Algemeen (copy)');
    await expect(page.getByRole('textbox', { name: 'Place' })).toHaveValue(
      'Hilversum',
    );
    await name.fill('Backend');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(versionPicker(page)).toHaveText(/Backend · Dutch/);

    // Without a history of its own, the copy is compared with the other CV
    await page.getByRole('button', { name: 'Compare versions' }).click();
    await expect(compare.locator('del', { hasText: 'Algemeen' })).toBeVisible();
    await expect(compare.locator('ins', { hasText: 'Backend' })).toBeVisible();
    await page.getByRole('button', { name: 'Close comparison' }).click();

    // Both versions are there; switch between them
    await selectVersion(page, 'Algemeen');
    await expect(versionPicker(page)).toHaveText(/Algemeen · Dutch/);

    // And delete them again
    await deleteShownCv(page);
    await expect(versionPicker(page)).toHaveText(/Backend · Dutch/);
    await deleteShownCv(page);
    await expect(page.getByTestId('cv-empty')).toContainText(
      'You have no CV yet',
    );
  });

  test('an admin starts on their own CV and picks whose CV to read', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await goToCv(page);

    const cv = page.getByRole('article');
    await expect(versionPicker(page)).toHaveText(/General · English/);
    await expect(
      cv.getByRole('heading', { name: 'Curriculum Vitae - Bert Muppets' }),
    ).toBeVisible();

    await selectPerson(page, 'Tommy Dog');
    await expect(versionPicker(page)).toHaveText(/Algemeen 2025 · Dutch/);
    await expect(
      cv.getByRole('heading', { name: 'Curriculum Vitae - Tommy Dog' }),
    ).toBeVisible();
    await expect(cv.getByText('Woonplaats')).toBeVisible();
    await expect(cv.getByText('tommy@sesam.straat')).toBeVisible();

    const overview = cv.getByRole('table').first();
    await expect(overview.getByRole('row')).toHaveCount(5);
    await expect(overview.getByRole('row').nth(1)).toContainText(
      '08-2024 - nu',
    );
    await expect(overview.getByRole('row').nth(2)).toContainText(
      '06-2020 - 11-2022',
    );
    await expect(overview.getByRole('row').nth(2)).toContainText('30');
    await expect(overview.getByRole('row').nth(2)).toContainText(
      'DHL (via Flock)',
    );
    await expect(
      cv.getByRole('link', {
        name: 'https://www.flock.community/cases/ing-front-end-team',
      }),
    ).toBeVisible();
    // The skills are listed per category, each under a heading of its own
    const programming = cv
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Programming' }) });
    await expect(
      programming
        .getByRole('listitem')
        .filter({ hasText: 'Kotlin' })
        .getByRole('img', { name: '5 of 5' }),
    ).toBeVisible();
    await expect(cv.getByRole('heading', { name: 'Opleiding' })).toBeVisible();
    await expect(cv.getByText('Engels – uitstekend')).toBeVisible();
    // The ING assignments show the logo of ING from the shared collection
    await expect(cv.getByRole('img', { name: 'Logo ING' })).toHaveCount(2);
    // An admin writes anybody's CV
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
    // The server makes the CV to download, as PDF or as Word
    await expect(
      page.getByRole('link', { name: 'Download PDF' }),
    ).toHaveAttribute('href', /^\/api\/cvs\/[^/]+\/pdf$/);
    await expect(
      page.getByRole('link', { name: 'Download Word' }),
    ).toHaveAttribute('href', /^\/api\/cvs\/[^/]+\/docx$/);
  });

  test('a link to a CV opens that CV, also after logging in', async ({
    page,
    context,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await goToCv(page);
    await selectPerson(page, 'Tommy Dog');
    await expect(versionPicker(page)).toHaveText(/Algemeen 2025 · Dutch/);
    // The address links to the CV shown
    await expect(page).toHaveURL(/\/cvs\/[^/?]+$/);
    const link = new URL(page.url()).pathname;

    // Comparing it has a link of its own
    await page.getByRole('button', { name: 'Compare versions' }).click();
    await expect(page).toHaveURL(new RegExp(`${link}/compare`));
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${link}$`));

    // Logged out, the link leads to the login page and then to the CV
    await context.clearCookies();
    await page.goto(link);
    await page.getByLabel('Username').fill(`${ADMIN_USERNAME}@sesam.straat`);
    await page.getByLabel('Password').fill(ADMIN_USERNAME);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(new RegExp(`${link}$`));
    // Somebody else's CV: the admin is switched to that person
    await expect(versionPicker(page)).toHaveText(/Algemeen 2025 · Dutch/);
    await expect(
      page
        .getByRole('article')
        .getByRole('heading', { name: 'Curriculum Vitae - Tommy Dog' }),
    ).toBeVisible();
  });
});

test.describe('Logos', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('a CV admin keeps the shared collection of logos', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.getByRole('link', { name: 'Logos', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Logos' })).toBeVisible();
    for (const name of ['ING', 'DHL', 'bol.com']) {
      await expect(page.getByRole('img', { name, exact: true })).toBeVisible();
    }

    const name = `Osiris ${Date.now()}`;
    await page.getByRole('button', { name: 'Add logo' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'Name' }).fill(name);
    await dialog
      .getByLabel('Logo image')
      .setInputFiles('tests/files/timesheet.png');
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('img', { name, exact: true })).toBeVisible();

    // A name in use is refused
    await page.getByRole('button', { name: 'Add logo' }).click();
    await dialog.getByRole('textbox', { name: 'Name' }).fill('ing');
    await dialog
      .getByLabel('Logo image')
      .setInputFiles('tests/files/timesheet.png');
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(
      dialog.getByText("There already is a logo named 'ing'"),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // Rename, then delete
    await page.getByRole('button', { name: `Change ${name}` }).click();
    await dialog.getByRole('textbox', { name: 'Name' }).fill(`${name} BV`);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('img', { name: `${name} BV`, exact: true }),
    ).toBeVisible();

    await page.getByRole('button', { name: `Delete ${name} BV` }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Confirm' })
      .click();
    await expect(
      page.getByRole('img', { name: `${name} BV`, exact: true }),
    ).toHaveCount(0);
  });
});
