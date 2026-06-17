// Budget admin e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false). Order matters: view -> create -> edit -> delete.
// Target person: pino@sesam.straat. Admin user: bert.
//
// Dev data for pino (current year):
//   Contract: hackTimeBudget=160, trainingTimeBudget=200, trainingMoneyBudget=EUR5000
//   Hours are deterministic: hack=16h used, training=0h used.
//   Training money "used" fluctuates (~€3.182 ± €50) due to syncBudgetAllocations across 26 events.
//
// Assertion strategy:
//   - Hours: exact assertions (deterministic)
//   - Training money: delta-based assertions (read baseline, verify relative change)
//   - Exact budget calculations verified in Spring Boot integration tests
//
// Note: BudgetCard renders EUR values with the € symbol and nl-NL locale
//   (e.g., 2500 -> "€2.500", 350 -> "€350", 0 -> "€0")
//   TrainingMoneyAllocationListItem renders amounts with 2 decimal places
//   (e.g., 350 -> "€350,00")
import { expect, test } from '@playwright/test';
import {
  Given_I_am_on_budget_tab_for_person,
  readCardUsedValue,
  Then_allocation_list_contains,
  Then_allocation_list_does_not_contain,
  Then_money_used_changed_by,
  Then_summary_card_shows,
  When_I_click_add_training_money,
  When_I_click_create_button,
  When_I_click_save_button,
  When_I_delete_allocation,
  When_I_edit_allocation,
  When_I_fill_training_money_form,
  When_I_update_training_money_amount,
} from './steps/budgetSteps';

test.describe('Budget Admin - View and Create', () => {
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

  test('BMGT-01: View budget summary cards for pino', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    await Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h');
    await Then_summary_card_shows(page, 'Training Hours', '200h', '200h', '0h');

    // Training money "used" fluctuates slightly between DB recreations (~€3.182 ± €50)
    // due to syncBudgetAllocations across 26 events. Only verify budget is correct.
    await Then_summary_card_shows(page, 'Training Money', null, '€5.000', null);
  });

  test('BMGT-02: Create standalone training money allocation', async ({
    page,
  }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    const baselineUsed = await readCardUsedValue(page, 'Training Money');

    await When_I_click_add_training_money(page);

    const currentYear = new Date().getFullYear();
    await When_I_fill_training_money_form(
      page,
      'Playwright test course',
      '350',
      `${currentYear}-06-15`,
    );

    await When_I_click_create_button(page);

    await Then_allocation_list_contains(
      page,
      'Playwright test course',
      '350,00',
    );

    await Then_money_used_changed_by(
      page,
      'Training Money',
      baselineUsed,
      350,
      '€5.000',
    );
  });
});

test.describe('Budget Admin - Edit and Delete', () => {
  // Tests in this describe block run after "View and Create".
  // BMGT-06 depends on the "Playwright test course" allocation created by BMGT-02.

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

  // BMGT-03: Edit training money allocation
  // Requires: "Playwright test course" allocation created by BMGT-02 (amount=350).
  // After edit: amount becomes 500. Delta from current state = +150 (500-350).
  test('BMGT-03: Edit training money allocation', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    const baselineUsed = await readCardUsedValue(page, 'Training Money');

    // Allocation created by BMGT-02 (amount=350) must be present before editing.
    await Then_allocation_list_contains(
      page,
      'Playwright test course',
      '350,00',
    );

    await When_I_edit_allocation(page, 'Playwright test course');

    await When_I_update_training_money_amount(page, '500');

    await When_I_click_save_button(page);

    await Then_allocation_list_contains(
      page,
      'Playwright test course',
      '500,00',
    );

    // used increases by €150 (500-350)
    await Then_money_used_changed_by(
      page,
      'Training Money',
      baselineUsed,
      150,
      '€5.000',
    );
  });

  // BMGT-04: Edit training time allocation
  // Pino has no standalone training time allocations in dev data.
  // Training time allocations are created via events and are event-linked;
  // event allocations have no edit/delete buttons by design.
  test.fixme('BMGT-04: Edit training time allocation', async ({ page }) => {
    // Skipped: No standalone training time allocations exist for pino in dev data.
    // Training time for pino comes only from event-linked allocations (e.g., "Hack Day - March"),
    // which are managed from the Events page and do not expose edit buttons.
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
  });

  // BMGT-05: Edit hack time allocation
  // Pino's hack time is event-linked ("Hack Day - March").
  // Event allocations are managed from the Events page and do not expose edit buttons.
  test.fixme('BMGT-05: Edit hack time allocation', async ({ page }) => {
    // Skipped: Pino's hack time allocation is event-linked (eventCode set).
    // Event allocations are grouped under EventAllocationListItem which has no edit/delete buttons.
    // To edit event-linked allocations, navigate to the Events page.
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
  });

  // BMGT-06: Delete training money allocation
  // onDelete IS wired in BudgetAllocationFeature, so the delete flow is fully functional.
  // This test depends on the "Playwright test course" allocation created by BMGT-02.
  test('BMGT-06: Delete training money allocation', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    const baselineUsed = await readCardUsedValue(page, 'Training Money');

    // After BMGT-03 edit the amount is 500 (was 350 from BMGT-02).
    await Then_allocation_list_contains(
      page,
      'Playwright test course',
      '500,00',
    );

    await When_I_delete_allocation(page, 'Playwright test course');

    await Then_allocation_list_does_not_contain(page, 'Playwright test course');

    // used decreases by €500 (the deleted allocation's amount)
    await Then_money_used_changed_by(
      page,
      'Training Money',
      baselineUsed,
      -500,
      '€5.000',
    );
  });
});

test.describe('Budget Admin - List UX', () => {
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

  // LIST-01: Event allocations must display a human-readable event name,
  // not a raw event code (e.g., not "HACKDAY_2026_03" or similar slug).
  // EventAllocationListItem derives eventName from allocations[0].description.
  // The test verifies the card header contains text that looks like a name
  // (has spaces or mixed case) rather than an all-caps/underscore code.
  test('LIST-01: Event allocation card shows event name not raw event code', async ({
    page,
  }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    await expect(page.getByText('Budget Allocations')).toBeVisible();

    // Pino has event-linked hack time allocations from dev data; the event name
    // comes from allocations[0].description.
    const allocationSection = page
      .locator('.MuiPaper-root')
      .filter({ hasText: 'Budget Allocations' });
    await expect(allocationSection).toBeVisible();

    // Event cards render an Event icon, so filter on EventIcon.
    const eventCards = allocationSection
      .locator('.MuiCard-root')
      .filter({ has: page.locator('svg[data-testid="EventIcon"]') });
    await expect(eventCards.first()).toBeVisible({ timeout: 10000 });

    const headerText = await eventCards
      .first()
      .locator('.MuiCardHeader-title')
      .textContent();
    const cleanedHeader = (headerText ?? '').replace(/\s+/g, ' ').trim();

    // A raw event code looks like "HACKDAY_2026_03" — all-uppercase with underscores/hyphens, no spaces.
    // A human-readable name contains spaces or mixed case.
    const looksLikeRawCode = /^[A-Z0-9_-]+$/.test(
      cleanedHeader.replace(/\s/g, ''),
    );
    if (looksLikeRawCode && !cleanedHeader.includes(' ')) {
      throw new Error(
        `LIST-01 FAILED: Event allocation header shows raw code "${cleanedHeader}" instead of a human-readable event name`,
      );
    }

    expect(cleanedHeader.length).toBeGreaterThan(0);
  });

  // LIST-02: Admin clicking the event allocation link navigates to /event?code={eventCode}.
  // EventAllocationListItem renders <Link href={`/event?code=${eventCode}`}> for isAdmin=true.
  // The test clicks the link and verifies the URL contains /event?code=.
  test('LIST-02: Admin clicking event allocation link navigates to /event?code=', async ({
    page,
  }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    await expect(page.getByText('Budget Allocations')).toBeVisible();

    const allocationSection = page
      .locator('.MuiPaper-root')
      .filter({ hasText: 'Budget Allocations' });

    // For admin users EventAllocationListItem renders a MUI Link with href="/event?code=...".
    const eventLink = allocationSection
      .locator('a[href*="/event?code="]')
      .first();
    await expect(eventLink).toBeVisible({ timeout: 10000 });

    const href = await eventLink.getAttribute('href');
    expect(href).toMatch(/\/event\?code=.+/);

    await eventLink.click();
    await page.waitForLoadState('networkidle');

    // The URL must contain /event?code= — this is the core LIST-02 requirement
    expect(page.url()).toMatch(/\/event\?code=.+/);
  });

  // LIST-03: Four filter chips (All / Hack Hours / Training Hours / Training Money) are present
  // and toggling them filters the allocation list.
  // Chips are rendered in BudgetAllocationFeature only when allocations.length > 0.
  test('LIST-03: Filter chips are present and toggle the allocation list', async ({
    page,
  }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    await expect(page.getByText('Budget Allocations')).toBeVisible();

    const allChip = page.getByRole('button', { name: 'All' }).first();
    const hackChip = page.getByRole('button', { name: 'Hack Hours' });
    const trainingHoursChip = page.getByRole('button', { name: 'Training Hours' });
    const trainingMoneyChip = page.getByRole('button', { name: 'Training Money' });

    await expect(allChip).toBeVisible({ timeout: 10000 });
    await expect(hackChip).toBeVisible();
    await expect(trainingHoursChip).toBeVisible();
    await expect(trainingMoneyChip).toBeVisible();

    const allocationSection = page
      .locator('.MuiPaper-root')
      .filter({ hasText: 'Budget Allocations' });
    const allItemsBefore = allocationSection.locator('.MuiCard-root');
    const totalCount = await allItemsBefore.count();
    expect(totalCount).toBeGreaterThan(0);

    await hackChip.click();
    await page.waitForLoadState('networkidle');

    // Filtering to Hack Hours hides standalone training money cards (freeform allocations),
    // so the count can only shrink.
    const hackItems = allocationSection.locator('.MuiCard-root');
    const hackCount = await hackItems.count();
    expect(hackCount).toBeGreaterThan(0); // pino has event-linked hack time
    expect(hackCount).toBeLessThanOrEqual(totalCount); // filter must not add items

    // An active MUI Chip (variant="filled") gets class MuiChip-filled.
    await expect(hackChip).toHaveClass(/MuiChip-filled/);
    await expect(allChip).not.toHaveClass(/MuiChip-colorPrimary/);

    await allChip.click();
    await page.waitForLoadState('networkidle');

    const restoredItems = allocationSection.locator('.MuiCard-root');
    const restoredCount = await restoredItems.count();
    expect(restoredCount).toBe(totalCount);

    await expect(allChip).toHaveClass(/MuiChip-colorPrimary/);
  });
});

test.describe('Budget Admin - UI Pattern Verification', () => {
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

  // UI-01: "Add training money" button matches the site-wide + Add pattern.
  // BudgetAllocationFeature renders <Button><AddIcon/> Add</Button> for admin users,
  // identical to ProjectFeature, AssignmentFeature, and WorkDayFeature.
  // Verified in source: BudgetAllocationFeature.tsx lines 162-166.
  test('UI-01: Add button renders with + Add pattern', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    const addButton = page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();
    // AddIcon renders as an svg.
    await expect(addButton.locator('svg')).toBeVisible();
  });
});
