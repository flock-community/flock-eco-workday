import { expect, test } from '@playwright/test';
import { findOnAnyPage } from './steps/dayListSteps';
import {
  Given_I_am_logged_in_as_user,
  When_I_click_the_button,
  When_I_fill_in_the_date_range_from_till,
} from './steps/workdaySteps';

// EventController exposes /api/events. The endpoints were migrated to
// Wirespec (see workday-application/src/main/wirespec/events.ws), so this
// spec covers the admin-facing CRUD flow end-to-end through the
// EventFeature page at /event:
//
//   - POST /api/events  (admin Bert creates a new event)
//   - GET  /api/events  (the new event surfaces in the paginated list)
//   - PUT  /api/events/{code} (admin updates the event description)
//   - DELETE /api/events/{code} (admin removes the event)
//
// Today's session date is 2026-05-02 so we keep the booking inside
// May 2026. 04-05-2026 is a Monday, which means the PeriodInputField
// renders a single hour input and avoids time-out issues seen with
// longer ranges.
const RUN_ID = Date.now();
const EVENT_DESCRIPTION = `E2E event ${RUN_ID}`;
const EVENT_DESCRIPTION_UPDATED = `${EVENT_DESCRIPTION} (updated)`;
const EVENT_FROM = '04-05-2026';
const EVENT_TO = '04-05-2026';
const EVENT_COSTS = '125';

test.describe
  .serial('EventController /api/events (Wirespec)', () => {
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test.afterEach(async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => {
        if (typeof window.localStorage !== 'undefined')
          window.localStorage.clear();
        if (typeof window.sessionStorage !== 'undefined')
          window.sessionStorage.clear();
      });
    });

    test('Admin creates an event (POST /api/events)', async ({ page }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');

      await page.goto('/event');
      await page.waitForLoadState('networkidle');

      await When_I_click_the_button(page, 'Add');
      const dialog = page.getByRole('dialog');
      // The dialog header is "Create Event"; anchor the assertions on the
      // Description input which only exists inside the form.
      await expect(dialog.getByLabel('Description')).toBeVisible();

      await dialog.getByLabel('Description').fill(EVENT_DESCRIPTION);
      await dialog.getByLabel('Costs').fill(EVENT_COSTS);
      await When_I_fill_in_the_date_range_from_till(page, EVENT_FROM, EVENT_TO);

      const eventPost = page.waitForResponse(
        (response) =>
          response.url().includes('/api/events') &&
          response.request().method() === 'POST' &&
          response.status() < 400,
      );
      await When_I_click_the_button(page, 'Save');
      await eventPost;
      await expect(dialog).toBeHidden({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Each event renders inside a Card. The seeded develop data inserts
      // ~27 events, so the new entry can sit one or two pages deep — walk
      // pagination to find the description.
      const eventCards = page
        .locator('.MuiCard-root:not(:has(.MuiCard-root))')
        .filter({ hasText: EVENT_DESCRIPTION });
      const eventCard = await findOnAnyPage(page, eventCards);
      await expect(eventCard).toContainText(EVENT_DESCRIPTION);
    });

    test('Admin updates the event (PUT /api/events/{code})', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');

      await page.goto('/event');
      await page.waitForLoadState('networkidle');

      const eventCards = page
        .locator('.MuiCard-root:not(:has(.MuiCard-root))')
        .filter({ hasText: EVENT_DESCRIPTION });
      const eventCard = await findOnAnyPage(page, eventCards);
      await eventCard.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog.getByLabel('Description')).toBeVisible();

      const descriptionField = dialog.getByLabel('Description');
      await descriptionField.fill(EVENT_DESCRIPTION_UPDATED);

      const eventPut = page.waitForResponse(
        (response) =>
          response.url().includes('/api/events/') &&
          response.request().method() === 'PUT' &&
          response.status() < 400,
      );
      await When_I_click_the_button(page, 'Save');
      await eventPut;
      await expect(dialog).toBeHidden({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      const updatedCards = page
        .locator('.MuiCard-root:not(:has(.MuiCard-root))')
        .filter({ hasText: EVENT_DESCRIPTION_UPDATED });
      await findOnAnyPage(page, updatedCards);
    });

    test('Admin deletes the event (DELETE /api/events/{code})', async ({
      page,
    }) => {
      await Given_I_am_logged_in_as_user(page, 'bert');

      await page.goto('/event');
      await page.waitForLoadState('networkidle');

      const eventCards = page
        .locator('.MuiCard-root:not(:has(.MuiCard-root))')
        .filter({ hasText: EVENT_DESCRIPTION_UPDATED });
      const eventCard = await findOnAnyPage(page, eventCards);
      await eventCard.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog.getByLabel('Description')).toBeVisible();

      const eventDelete = page.waitForResponse(
        (response) =>
          response.url().includes('/api/events/') &&
          response.request().method() === 'DELETE' &&
          response.status() < 400,
      );
      // The DialogFooter renders a Delete button that opens a ConfirmDialog.
      await dialog.getByRole('button', { name: /delete/i }).click();
      const confirmDialog = page
        .getByRole('dialog')
        .filter({ hasText: 'Are you sure' });
      await expect(confirmDialog).toBeVisible();
      await confirmDialog
        .getByRole('button', { name: /confirm|yes|ok/i })
        .click();
      await eventDelete;
      await page.waitForLoadState('networkidle');

      // Walking pagination back to page 1 first ensures the assertion is
      // not run against a stale page that no longer exists after deletion.
      await page.goto('/event');
      await page.waitForLoadState('networkidle');
      const remaining = page
        .locator('.MuiCard-root:not(:has(.MuiCard-root))')
        .filter({ hasText: EVENT_DESCRIPTION_UPDATED });
      const maxPages = 25;
      for (let i = 0; i < maxPages; i++) {
        await expect(remaining).toHaveCount(0);
        const nextBtn = page.getByRole('button', { name: 'Go to next page' });
        if (
          (await nextBtn.count()) === 0 ||
          !(await nextBtn.isVisible()) ||
          !(await nextBtn.isEnabled())
        ) {
          break;
        }
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
      }
    });
  });
