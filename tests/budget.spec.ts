import { expect, test } from '@playwright/test';
import { findOnAnyPage } from './steps/dayListSteps';
import {
  Given_I_am_logged_in_as_user,
  When_I_click_the_button,
  When_I_fill_in_the_date_range_from_till,
} from './steps/workdaySteps';

// Budget-on-EventDay consuming feature:
//   - GET /api/budget-summary renders the three summary cards (/budget page)
//   - The event dialog exposes the "Event type" budget marker,
//     and a TRAINING-marked event persists through POST /api/events.
//
// The session date sits in May 2026 (see events.spec.ts), so the booking and
// the current-year budget summary line up with the seeded develop data.
const RUN_ID = Date.now();
const TRAINING_EVENT_DESCRIPTION = `E2E training ${RUN_ID}`;
const EVENT_FROM = '04-05-2026';
const EVENT_TO = '04-05-2026';
const EVENT_COSTS = '300';

test.describe('Budget on EventDay', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('Admin sees the budget summary cards', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'bert');

    const summaryResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/budget-summary') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    );
    await page.goto('/budget');
    await summaryResponse;

    await expect(page.getByText('Hack Hours')).toBeVisible();
    await expect(page.getByText('Training Hours')).toBeVisible();
    await expect(page.getByText('Training Money')).toBeVisible();
    await expect(page.getByText('Budget:').first()).toBeVisible();
    await expect(page.getByText('Used:').first()).toBeVisible();
  });

  test('Admin creates a TRAINING-marked event', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'bert');

    await page.goto('/event');
    await page.waitForLoadState('networkidle');

    await When_I_click_the_button(page, 'Add');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Description')).toBeVisible();

    await dialog.getByLabel('Description').fill(TRAINING_EVENT_DESCRIPTION);
    await dialog.getByLabel('Costs').fill(EVENT_COSTS);

    await dialog.getByLabel('Event type').click();
    await page.getByRole('option', { name: 'Training' }).click();

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

    const eventCards = page
      .locator('.MuiCard-root:not(:has(.MuiCard-root))')
      .filter({ hasText: TRAINING_EVENT_DESCRIPTION });
    const eventCard = await findOnAnyPage(page, eventCards);
    await expect(eventCard).toContainText(TRAINING_EVENT_DESCRIPTION);
  });
});
