import { expect, type Locator, type Page } from '@playwright/test';

// Walk the FlockPagination ("Go to next page") until `locator` resolves.
// The WorkDay/SickDay/LeaveDay listings are server-paginated and the seeded
// mock data spreads many entries across years for every fixture user, so a
// run-specific entry can sit several pages deep.
export async function findOnAnyPage(
  page: Page,
  locator: Locator,
  maxPages = 25,
): Promise<Locator> {
  for (let i = 0; i < maxPages; i++) {
    if ((await locator.count()) > 0) {
      return locator.first();
    }
    const nextBtn = page.getByRole('button', { name: 'Go to next page' });
    if (
      (await nextBtn.count()) === 0 ||
      !(await nextBtn.isVisible()) ||
      !(await nextBtn.isEnabled())
    ) {
      throw new Error(
        `findOnAnyPage: could not find locator within ${maxPages} pages`,
      );
    }
    await nextBtn.click();
    await page.waitForLoadState('networkidle');
  }
  throw new Error('findOnAnyPage: exceeded the page-walk safety limit');
}

export async function selectPersonInLayout(page: Page, personName: string) {
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: personName }).click();
  await page.waitForLoadState('networkidle');
}

export async function changeStatusOnLocator(
  page: Page,
  locator: Locator,
  fromStatus: string,
  toStatus: string,
) {
  await expect(locator).toBeVisible();
  await locator.getByRole('button', { name: fromStatus }).click();
  await page.getByRole('menuitem', { name: toStatus }).click();
  await page.waitForLoadState('networkidle');
  await expect(locator.getByRole('button', { name: toStatus })).toBeVisible();
}
