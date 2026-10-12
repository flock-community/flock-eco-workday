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
  await expect(page).toHaveURL(/\/cvs(\?|$)/);
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
    await expect(cv.getByText('Working experience')).toBeVisible();
    await expect(cv.getByRole('table')).toContainText('03-2021 - 12-2023');
    await expect(cv.getByRole('table')).toContainText('34');

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
    await expect(
      cv.getByRole('heading', { name: 'Vaardigheden' }),
    ).toBeVisible();
    await expect(
      cv
        .getByRole('row', { name: /Kotlin/ })
        .getByRole('img', { name: '5 of 5' }),
    ).toBeVisible();
    await expect(cv.getByRole('heading', { name: 'Opleiding' })).toBeVisible();
    await expect(cv.getByText('Engels – uitstekend')).toBeVisible();
    // The ING assignments show the logo of ING from the shared collection
    await expect(cv.getByRole('img', { name: 'Logo ING' })).toHaveCount(2);
    // An admin writes anybody's CV
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Print or save as PDF' }),
    ).toBeEnabled();
  });

  test('a CV saved as PDF can be imported again as a new version', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await goToCv(page);
    await selectPerson(page, 'Tommy Dog');
    await expect(
      page
        .getByRole('article')
        .getByRole('heading', { name: 'Curriculum Vitae - Tommy Dog' }),
    ).toBeVisible();

    // What "Print or save as PDF" produces: the print stylesheet leaves only the CV
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await page.emulateMedia({ media: 'screen' });
    const file = {
      name: 'CV Tommy Dog NL.pdf',
      mimeType: 'application/pdf',
      buffer: pdf,
    };

    await page.getByLabel('CV PDF').setInputFiles(file);

    await expect(
      page.getByRole('heading', { name: 'New CV of Tommy Dog' }),
    ).toBeVisible();
    await expect(
      page.getByText('Read from CV Tommy Dog NL.pdf (Tommy Dog)'),
    ).toBeVisible();
    await expect(page.getByText(/looks like the CV of/)).toHaveCount(0);
    // The new version is named after the file
    await expect(
      page.getByRole('textbox', { name: 'Name of this version' }),
    ).toHaveValue('CV Tommy Dog NL');
    await expect(page.getByRole('textbox', { name: 'Place' })).toHaveValue(
      'Hilversum',
    );
    await expect(page.getByRole('textbox', { name: 'Profile' })).toHaveValue(
      /^Tommy Dog is een innovatieve software engineer/,
    );
    await expect(page.getByTestId('cv-experience')).toHaveCount(4);
    const latest = page.getByTestId('cv-experience').first();
    await expect(latest.getByRole('textbox', { name: 'Client' })).toHaveValue(
      'ING',
    );
    await expect(latest.getByRole('textbox', { name: 'Via' })).toHaveValue(
      'Flock',
    );
    // The logo comes from the shared collection, by the name of the client
    await expect(latest.getByRole('combobox', { name: 'Logo' })).toHaveValue(
      'ING',
    );
    await expect(latest.locator('.MuiChip-label')).toHaveText([
      'Webcomponents',
      'Typescript',
      'MSW',
      'Wirespec',
      'Docker',
      'Playwright',
      'Storybook',
    ]);
    await expect(page.getByRole('textbox', { name: 'Education' })).toHaveValue(
      /^Master, Business Information Management, Rotterdam \(2012\)/,
    );
    await expect(page.getByRole('textbox', { name: 'Languages' })).toHaveValue(
      'Nederlands – moedertaal\nEngels – uitstekend',
    );
    // The stars of a CV printed from Workday are text, so its skills come along
    await expect(page.getByTestId('cv-skill')).toHaveCount(10);
    await expect(
      page
        .getByTestId('cv-skill')
        .first()
        .getByRole('textbox', { name: 'Skill' }),
    ).toHaveValue('Kotlin');

    // A name that is taken is refused
    await page
      .getByRole('textbox', { name: 'Name of this version' })
      .fill('algemeen 2025');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByText("Tommy Dog already has a CV named 'algemeen 2025'"),
    ).toBeVisible();

    // Under its own name it is stored next to the other version
    await page
      .getByRole('textbox', { name: 'Name of this version' })
      .fill('Imported');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(versionPicker(page)).toHaveText(/Imported · Dutch/);
    await deleteShownCv(page);
    await expect(versionPicker(page)).toHaveText(/Algemeen 2025 · Dutch/);

    // Importing Tommy's PDF for somebody else gets a warning
    await selectPerson(page, 'Bert Muppets');
    await page.getByLabel('CV PDF').setInputFiles(file);
    await expect(
      page.getByRole('heading', { name: 'New CV of Bert Muppets' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'This PDF looks like the CV of Tommy Dog, but you are writing the CV of Bert Muppets.',
      ),
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
