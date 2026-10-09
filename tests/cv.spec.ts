import { expect, type Page, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const CV_URL = '/cvs';
const ADMIN_USERNAME = 'bert';
const WORKER_USERNAME = 'ernie';

function cvRow(page: Page, personName: string) {
  return page.locator('table tbody tr').filter({ hasText: personName }).first();
}

async function goToCvs(page: Page) {
  await page.goto(CV_URL);
  await expect(page.getByRole('heading', { name: 'CVs' })).toBeVisible();
  await page.waitForLoadState('networkidle');
}

async function fillMonth(page: Page, label: string, month: string) {
  const input = page.getByLabel(label, { exact: true }).first();
  await input.click();
  await input.fill(month);
  await input.press('Tab');
}

/** CVs left behind by an earlier, failed run would make the next one collide on language. */
async function deleteOwnCvIfAny(page: Page, personName: string) {
  const row = cvRow(page, personName);
  if ((await row.count()) === 0) return;
  await row.click();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirm' })
    .click();
  await expect(page).toHaveURL(/\/cvs$/);
  await page.waitForLoadState('networkidle');
}

test.describe('CVs', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('an admin sees the CVs of everybody and reads one in the Flock template', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await goToCvs(page);

    const tommysCv = cvRow(page, 'Tommy Dog');
    await expect(tommysCv).toContainText('Dutch');
    await expect(tommysCv).toContainText(
      'Software Engineer at ING (via Flock)',
    );
    await expect(cvRow(page, 'Bert Muppets')).toContainText('English');

    await tommysCv.click();
    const cv = page.getByRole('article');
    await expect(
      cv.getByRole('heading', { name: 'Curriculum Vitae - Tommy Dog' }),
    ).toBeVisible();
    await expect(cv.getByText('Woonplaats')).toBeVisible();
    await expect(cv.getByText('tommy@sesam.straat')).toBeVisible();

    const overview = cv.getByRole('table').first();
    await expect(overview.getByRole('row')).toHaveCount(5);
    await expect(overview.getByRole('row').nth(2)).toContainText(
      '06-2020 - 11-2022',
    );
    await expect(overview.getByRole('row').nth(2)).toContainText('30');
    await expect(overview.getByRole('row').nth(2)).toContainText(
      'DHL (via Flock)',
    );
    await expect(overview.getByRole('row').nth(1)).toContainText(
      '08-2024 - nu',
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
  });

  test('a worker writes, edits and deletes their own CV', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, WORKER_USERNAME);
    await goToCvs(page);
    await deleteOwnCvIfAny(page, 'Ernie Muppets');
    // A worker only sees their own CVs
    await expect(cvRow(page, 'Tommy Dog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('heading', { name: 'New CV' })).toBeVisible();
    // Only an admin picks the person
    await expect(page.getByRole('combobox', { name: 'Person' })).toHaveCount(0);

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

    // Edit: switch to English and end the job
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await fillMonth(page, 'To', '12-2023');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(cv.getByText('Working experience')).toBeVisible();
    await expect(cv.getByRole('table')).toContainText('03-2021 - 12-2023');
    await expect(cv.getByRole('table')).toContainText('34');

    // And delete it again
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Confirm' })
      .click();
    await expect(page).toHaveURL(/\/cvs$/);
    await expect(cvRow(page, 'Ernie Muppets')).toHaveCount(0);
  });

  test('a CV saved as PDF can be imported again', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await goToCvs(page);
    await cvRow(page, 'Tommy Dog').click();
    await expect(page.getByRole('article')).toBeVisible();

    // What "Print or save as PDF" produces: the print stylesheet leaves only the CV
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await page.emulateMedia({ media: 'screen' });

    await goToCvs(page);
    await page.getByLabel('CV PDF').setInputFiles({
      name: 'CV Tommy Dog NL.pdf',
      mimeType: 'application/pdf',
      buffer: pdf,
    });

    await expect(page.getByRole('heading', { name: 'New CV' })).toBeVisible();
    await expect(
      page.getByText('Read from CV Tommy Dog NL.pdf (Tommy Dog)'),
    ).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Person' })).toHaveValue(
      /Tommy Dog/,
    );
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

    // Tommy already has a Dutch CV, so this one cannot be stored next to it
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Tommy Dog already has a NL CV')).toBeVisible();
  });
});
