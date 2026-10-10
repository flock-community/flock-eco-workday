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

  test('a worker sees only their own CV, and writes, edits and deletes it', async ({
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
      'You have no Dutch CV yet',
    );

    await page.getByRole('link', { name: 'Write CV' }).click();
    await expect(
      page.getByRole('heading', { name: 'New CV of Ernie Muppets' }),
    ).toBeVisible();
    await page.getByRole('textbox', { name: 'Place' }).fill('Hilversum');
    await page
      .getByRole('textbox', { name: 'Profile' })
      .fill('Ernie is an engineer who likes rubber ducks.');

    // Save without the required fields of an experience is refused in the form
    await page.getByRole('button', { name: 'Add experience' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Role is required')).toBeVisible();

    await fillMonth(page, 'From', '03-2021');
    await page.getByRole('textbox', { name: 'Role' }).fill('Backend engineer');
    await page.getByRole('textbox', { name: 'Client' }).fill('NS');
    await page.getByRole('textbox', { name: 'Via' }).fill('Flock');
    await page
      .getByRole('textbox', { name: 'Technologies' })
      .fill('Kotlin, Spring Boot');
    await page
      .getByRole('textbox', { name: 'Description' })
      .fill('Ernie built the journey planner.');
    await page.getByRole('button', { name: 'Save' }).click();

    // Back on the CV page, with the new CV
    const cv = page.getByRole('article');
    await expect(
      cv.getByRole('heading', { name: 'Curriculum Vitae - Ernie Muppets' }),
    ).toBeVisible();
    await expect(cv.getByRole('table')).toContainText('03-2021 - nu');
    await expect(cv.getByRole('table')).toContainText('NS (via Flock)');
    await expect(cv.getByText('Kotlin, Spring Boot')).toBeVisible();
    await expect(
      cv.getByText('Ernie built the journey planner.'),
    ).toBeVisible();

    // Edit: make it the English CV and end the job
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await fillMonth(page, 'To', '12-2023');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('tab', { name: 'English' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(cv.getByText('Working experience')).toBeVisible();
    await expect(cv.getByRole('table')).toContainText('03-2021 - 12-2023');
    await expect(cv.getByRole('table')).toContainText('34');

    // The Dutch one is gone now
    await page.getByRole('tab', { name: 'Dutch' }).click();
    await expect(page.getByTestId('cv-empty')).toContainText(
      'You have no Dutch CV yet',
    );

    // And delete the English one
    await page.getByRole('tab', { name: 'English' }).click();
    await deleteShownCv(page);
    await page.getByRole('tab', { name: 'English' }).click();
    await expect(page.getByTestId('cv-empty')).toContainText(
      'You have no English CV yet',
    );
  });

  test('an admin starts on their own CV and picks whose CV to read', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await goToCv(page);

    // Bert only has an English CV, so that is the one shown
    const cv = page.getByRole('article');
    await expect(page.getByRole('tab', { name: 'English' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      cv.getByRole('heading', { name: 'Curriculum Vitae - Bert Muppets' }),
    ).toBeVisible();

    await selectPerson(page, 'Tommy Dog');
    await expect(page.getByRole('tab', { name: 'Dutch' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
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
    await expect(
      page.getByRole('button', { name: 'Print or save as PDF' }),
    ).toBeEnabled();

    await page.getByRole('tab', { name: 'English' }).click();
    await expect(page.getByTestId('cv-empty')).toContainText(
      'Tommy Dog has no English CV yet',
    );
  });

  test('a CV saved as PDF can be imported again', async ({ page }) => {
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

    // Tommy has no English CV yet: start one from the PDF
    await page.getByRole('tab', { name: 'English' }).click();
    await page.getByLabel('CV PDF').setInputFiles(file);

    await expect(
      page.getByRole('heading', { name: 'New CV of Tommy Dog' }),
    ).toBeVisible();
    await expect(
      page.getByText('Read from CV Tommy Dog NL.pdf (Tommy Dog)'),
    ).toBeVisible();
    await expect(page.getByText(/looks like the CV of/)).toHaveCount(0);
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
    await expect(
      latest.getByRole('textbox', { name: 'Technologies' }),
    ).toHaveValue(
      'Webcomponents, Typescript, MSW, Wirespec, Docker, Playwright, Storybook',
    );
    await expect(page.getByRole('textbox', { name: 'Education' })).toHaveValue(
      /^Master, Business Information Management, Rotterdam \(2012\)/,
    );
    await expect(page.getByRole('textbox', { name: 'Languages' })).toHaveValue(
      'Nederlands – moedertaal\nEngels – uitstekend',
    );
    // The stars of the skills are images, so skills are entered by hand
    await expect(page.getByTestId('cv-skill')).toHaveCount(0);

    // The PDF is Dutch and Tommy already has a Dutch CV, so it cannot be stored
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Tommy Dog already has a NL CV')).toBeVisible();

    // Cancel goes back to Tommy's CV page
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('cv-empty')).toContainText(
      'Tommy Dog has no English CV yet',
    );

    // Importing Tommy's PDF for somebody else gets a warning
    await selectPerson(page, 'Bert Muppets');
    await page.getByRole('tab', { name: 'Dutch' }).click();
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
