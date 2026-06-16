// Budget admin e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false). Order matters: view -> create -> edit -> delete.
// Target person: pino@sesam.straat. Admin user: bert.
//
// Dev data for pino (current year):
//   Contract: hackHours=160, studyHours=200, studyMoney=EUR5000
//   Hours are deterministic: hack=16h used, study=0h used.
//   Study money "used" fluctuates (~€3.182 ± €50) due to syncBudgetAllocations across 26 events.
//
// Assertion strategy:
//   - Hours: exact assertions (deterministic)
//   - Study money: delta-based assertions (read baseline, verify relative change)
//   - Exact budget calculations verified in Spring Boot integration tests
//
// Note: BudgetCard renders EUR values with the € symbol and nl-NL locale
//   (e.g., 2500 -> "€2.500", 350 -> "€350", 0 -> "€0")
//   StudyMoneyAllocationListItem renders amounts with 2 decimal places
//   (e.g., 350 -> "€350,00")
import { test, expect } from '@playwright/test';
import {
  Given_I_am_on_budget_tab_for_person,
  Then_summary_card_shows,
  When_I_click_add_study_money,
  When_I_fill_study_money_form,
  When_I_click_create_button,
  Then_allocation_list_contains,
  When_I_delete_allocation,
  Then_allocation_list_does_not_contain,
  When_I_edit_allocation,
  When_I_update_study_money_amount,
  When_I_click_save_button,
  readCardUsedValue,
  Then_money_used_changed_by,
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

    // Hours are deterministic — assert exact values
    await Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h');
    await Then_summary_card_shows(page, 'Study Hours', '200h', '200h', '0h');

    // Study money "used" fluctuates slightly between DB recreations (~€3.182 ± €50)
    // due to syncBudgetAllocations across 26 events. Only verify budget is correct.
    await Then_summary_card_shows(page, 'Study Money', null, '€5.000', null);
  });

  test('BMGT-02: Create standalone study money allocation', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Capture baseline money used before the action
    const baselineUsed = await readCardUsedValue(page, 'Study Money');

    // Click Add Study Money button
    await When_I_click_add_study_money(page);

    // Fill in study money form.
    // Use a date in current year, amount 350, meaningful description.
    const currentYear = new Date().getFullYear();
    await When_I_fill_study_money_form(
      page,
      'Playwright test course',
      '350',
      `${currentYear}-06-15`,
    );

    // Submit
    await When_I_click_create_button(page);

    // Verify new allocation appears in list.
    await Then_allocation_list_contains(page, 'Playwright test course', '350,00');

    // Verify study money used increased by exactly €350
    await Then_money_used_changed_by(page, 'Study Money', baselineUsed, 350, '€5.000');
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

  // BMGT-03: Edit study money allocation
  // Requires: "Playwright test course" allocation created by BMGT-02 (amount=350).
  // After edit: amount becomes 500. Delta from current state = +150 (500-350).
  test('BMGT-03: Edit study money allocation', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Capture baseline before editing
    const baselineUsed = await readCardUsedValue(page, 'Study Money');

    // Verify the allocation from BMGT-02 is present before editing
    await Then_allocation_list_contains(page, 'Playwright test course', '350,00');

    // Click edit button on the "Playwright test course" card
    await When_I_edit_allocation(page, 'Playwright test course');

    // Change the amount from 350 to 500
    await When_I_update_study_money_amount(page, '500');

    // Save the changes
    await When_I_click_save_button(page);

    // Verify the list item shows the updated amount
    await Then_allocation_list_contains(page, 'Playwright test course', '500,00');

    // Verify study money used increased by €150 (500-350)
    await Then_money_used_changed_by(page, 'Study Money', baselineUsed, 150, '€5.000');
  });

  // BMGT-04: Edit study time allocation
  // Pino has no standalone study time allocations in dev data.
  // Study time allocations are created via events and are event-linked;
  // event allocations have no edit/delete buttons by design.
  test.fixme(
    'BMGT-04: Edit study time allocation',
    async ({ page }) => {
      // Skipped: No standalone study time allocations exist for pino in dev data.
      // Study time for pino comes only from event-linked allocations (e.g., "Hack Day - March"),
      // which are managed from the Events page and do not expose edit buttons.
      await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    },
  );

  // BMGT-05: Edit hack time allocation
  // Pino's hack time is event-linked ("Hack Day - March").
  // Event allocations are managed from the Events page and do not expose edit buttons.
  test.fixme(
    'BMGT-05: Edit hack time allocation',
    async ({ page }) => {
      // Skipped: Pino's hack time allocation is event-linked (eventCode set).
      // Event allocations are grouped under EventAllocationListItem which has no edit/delete buttons.
      // To edit event-linked allocations, navigate to the Events page.
      await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    },
  );

  // BMGT-06: Delete study money allocation
  // onDelete IS wired in BudgetAllocationFeature, so the delete flow is fully functional.
  // This test depends on the "Playwright test course" allocation created by BMGT-02.
  test('BMGT-06: Delete study money allocation', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Capture baseline before deletion
    const baselineUsed = await readCardUsedValue(page, 'Study Money');

    // Verify the allocation exists before attempting deletion.
    // After BMGT-03 edit: study money amount is 500 (was 350 from BMGT-02)
    await Then_allocation_list_contains(page, 'Playwright test course', '500,00');

    // Delete via confirm dialog: clicks delete button, waits for ConfirmDialog, clicks Confirm
    await When_I_delete_allocation(page, 'Playwright test course');

    // Verify the allocation is no longer in the list
    await Then_allocation_list_does_not_contain(page, 'Playwright test course');

    // Verify study money used decreased by €500 (the deleted allocation's amount)
    await Then_money_used_changed_by(page, 'Study Money', baselineUsed, -500, '€5.000');
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
  test('LIST-01: Event allocation card shows event name not raw event code', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Wait for the allocation list to load
    await expect(page.getByText('Budget Allocations')).toBeVisible();

    // Find the event allocation group card — EventAllocationListItem renders a Card
    // with a CardHeader. The card should be visible and contain a human-readable title.
    // Pino has event-linked hack time allocations from dev data.
    // The event name comes from allocations[0].description which is the event description.
    const allocationSection = page.locator('.MuiPaper-root').filter({ hasText: 'Budget Allocations' });
    await expect(allocationSection).toBeVisible();

    // There should be at least one event card (EventAllocationListItem).
    // Event cards render an Event icon + a Link (for admin) with the event name.
    // The event name must NOT be a raw code pattern (all-caps with underscores/hyphens only).
    const eventCards = allocationSection.locator('.MuiCard-root').filter({ has: page.locator('svg[data-testid="EventIcon"]') });
    await expect(eventCards.first()).toBeVisible({ timeout: 10000 });

    const headerText = await eventCards.first().locator('.MuiCardHeader-title').textContent();
    // Strip whitespace
    const cleanedHeader = (headerText ?? '').replace(/\s+/g, ' ').trim();

    // A raw event code looks like "HACKDAY_2026_03" — all-uppercase with underscores/hyphens, no spaces.
    // A human-readable name contains spaces or mixed case.
    const looksLikeRawCode = /^[A-Z0-9_\-]+$/.test(cleanedHeader.replace(/\s/g, ''));
    if (looksLikeRawCode && !cleanedHeader.includes(' ')) {
      throw new Error(
        `LIST-01 FAILED: Event allocation header shows raw code "${cleanedHeader}" instead of a human-readable event name`,
      );
    }

    // Additionally, verify the text is non-empty and not equal to an empty string
    expect(cleanedHeader.length).toBeGreaterThan(0);
  });

  // LIST-02: Admin clicking the event allocation link navigates to /event?code={eventCode}.
  // EventAllocationListItem renders <Link href={`/event?code=${eventCode}`}> for isAdmin=true.
  // The test clicks the link and verifies the URL contains /event?code=.
  test('LIST-02: Admin clicking event allocation link navigates to /event?code=', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    await expect(page.getByText('Budget Allocations')).toBeVisible();

    const allocationSection = page.locator('.MuiPaper-root').filter({ hasText: 'Budget Allocations' });

    // Find the event link — EventAllocationListItem renders a MUI Link for admin users
    // with href="/event?code=...". The link contains the event name text + OpenInNew icon.
    const eventLink = allocationSection.locator('a[href*="/event?code="]').first();
    await expect(eventLink).toBeVisible({ timeout: 10000 });

    // Verify the href already contains the correct pattern before clicking
    const href = await eventLink.getAttribute('href');
    expect(href).toMatch(/\/event\?code=.+/);

    // Click the link and verify navigation
    await eventLink.click();
    await page.waitForLoadState('networkidle');

    // The URL must contain /event?code= — this is the core LIST-02 requirement
    expect(page.url()).toMatch(/\/event\?code=.+/);
  });

  // LIST-03: Four filter chips (All / Hack Hours / Study Hours / Study Money) are present
  // and toggling them filters the allocation list.
  // Chips are rendered in BudgetAllocationFeature only when allocations.length > 0.
  test('LIST-03: Filter chips are present and toggle the allocation list', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    await expect(page.getByText('Budget Allocations')).toBeVisible();

    // Verify all four chips are visible
    const allChip = page.getByRole('button', { name: 'All' }).first();
    const hackChip = page.getByRole('button', { name: 'Hack Hours' });
    const studyHoursChip = page.getByRole('button', { name: 'Study Hours' });
    const studyMoneyChip = page.getByRole('button', { name: 'Study Money' });

    await expect(allChip).toBeVisible({ timeout: 10000 });
    await expect(hackChip).toBeVisible();
    await expect(studyHoursChip).toBeVisible();
    await expect(studyMoneyChip).toBeVisible();

    // Record total item count before filtering
    const allocationSection = page.locator('.MuiPaper-root').filter({ hasText: 'Budget Allocations' });
    const allItemsBefore = allocationSection.locator('.MuiCard-root');
    const totalCount = await allItemsBefore.count();
    expect(totalCount).toBeGreaterThan(0);

    // Click "Hack Hours" chip — should filter to only HACK_TIME allocations
    await hackChip.click();
    await page.waitForLoadState('networkidle');

    // After filtering, only hack-type cards should be visible.
    // Study money standalone cards should be hidden (they are freeform allocations).
    // The count must be less than or equal to the total (and at least 1 for pino who has hack time).
    const hackItems = allocationSection.locator('.MuiCard-root');
    const hackCount = await hackItems.count();
    expect(hackCount).toBeGreaterThan(0); // pino has event-linked hack time
    expect(hackCount).toBeLessThanOrEqual(totalCount); // filter must not add items

    // Verify "Hack Hours" is now active (filled variant) and "All" is not
    // MUI Chip with variant="filled" gets class MuiChip-filled
    await expect(hackChip).toHaveClass(/MuiChip-filled/);
    await expect(allChip).not.toHaveClass(/MuiChip-colorPrimary/);

    // Click "All" to restore — count should return to original total
    await allChip.click();
    await page.waitForLoadState('networkidle');

    const restoredItems = allocationSection.locator('.MuiCard-root');
    const restoredCount = await restoredItems.count();
    expect(restoredCount).toBe(totalCount);

    // "All" chip should now be active (primary color)
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

  // UI-01: "Add study money" button matches the site-wide + Add pattern.
  // BudgetAllocationFeature renders <Button><AddIcon/> Add</Button> for admin users,
  // identical to ProjectFeature, AssignmentFeature, and WorkDayFeature.
  // Verified in source: BudgetAllocationFeature.tsx lines 162-166.
  test('UI-01: Add button renders with + Add pattern', async ({ page }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    // Admin sees the Add button (conditional on isAdmin)
    const addButton = page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();
    // Confirm the button contains an SVG icon (AddIcon renders as svg)
    await expect(addButton.locator('svg')).toBeVisible();
  });
});
