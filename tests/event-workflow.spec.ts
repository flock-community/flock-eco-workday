// Event workflow e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false). Order matters: create -> verify budget impact.
// Admin user: bert. Target participants: pino@sesam.straat, ieniemienie@sesam.straat.
//
// Dev data baselines (current year, from develop seed data + event sync):
//   Pino contract: hackTimeBudget=160, trainingTimeBudget=200, trainingMoneyBudget=EUR5000
//     Hours are deterministic: hackUsed=16h, trainingUsed=0h
//     Training money "used" fluctuates (~€3.182 ± €50)
//   Ieniemienie: hackTimeBudget=160, trainingTimeBudget=200, trainingMoneyBudget=EUR5000
//     Hours are deterministic: hackUsed=40h, trainingUsed=32h
//     Training money "used" fluctuates (~€625 ± €50)
//
// Assertion strategy:
//   - Hours: exact assertions (deterministic)
//   - Training money: delta-based assertions (read baseline, verify relative change)
//
// Backend behavior: EventService.create/update atomically syncs budget allocations.
// When an event is saved with participants + defaultTimeAllocationType:
//   - New participants get auto-created time + money allocations
//   - Removed participants get their allocations deleted
//   - defaultTimeAllocationType is persisted on the Event entity

import { expect, test } from '@playwright/test';
import {
  Given_I_am_on_budget_tab_for_person,
  readCardUsedValue,
  Then_money_used_changed_by,
  Then_summary_card_shows,
} from './steps/budgetSteps';
import {
  Given_I_am_on_events_page,
  Then_budget_tab_shows_event_allocation,
  Then_collapsed_banner_shows_money_summary,
  Then_event_list_contains,
  Then_participant_hours_equals,
  When_I_add_participant,
  When_I_add_second_participant,
  When_I_click_add_event,
  When_I_customize_participant_hours,
  When_I_ensure_participant_customized,
  When_I_expand_budget_accordion,
  When_I_expand_time_accordion,
  When_I_fill_event_form,
  When_I_open_event_by_description,
  When_I_remove_participant_from_event,
  When_I_save_event,
  When_I_submit_event_form,
} from './steps/eventSteps';

const currentYear = new Date().getFullYear();

// Shared state between sequential tests — captured in EVNT-01, used in EVNT-04
let pinoMoneyBaseline: string;

/**
 * Clean up any leftover "PW Test Hack Day" events from previous test runs.
 * Uses Playwright browser context to authenticate and call APIs.
 * Timeout: 30s — cleanup is best-effort.
 */
async function cleanupTestEvents(browser: import('@playwright/test').Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  try {
    await page.goto('/auth', { timeout: 10000 });
    await page.getByLabel('Username').fill('bert@sesam.straat');
    await page.getByLabel('Password').fill('bert');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/*', { timeout: 15000 });

    // Use page.evaluate to call APIs with the authenticated session
    await page.evaluate(async () => {
      const eventsRes = await fetch(
        '/api/events?page=0&size=100&sort=from,desc',
      );
      if (!eventsRes.ok) return;
      const eventsData = await eventsRes.json();
      const events = eventsData.content || eventsData;
      for (const event of events) {
        if (event.description === 'PW Test Hack Day') {
          await fetch(`/api/events/${event.code}`, { method: 'DELETE' });
        }
      }
    });
  } catch {
    // Cleanup is best-effort; tests are designed for a clean database
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe('Event Workflow - Create and Budget Verification', () => {
  test.beforeAll(async ({ browser }) => {
    await cleanupTestEvents(browser);
  });

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

  test('EVNT-01: Create event and capture budget baseline', async ({
    page,
  }) => {
    // Baseline must be captured BEFORE creating the event (used by EVNT-04).
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    pinoMoneyBaseline = await readCardUsedValue(page, 'Training Money');

    // Single-step create: backend auto-creates allocations atomically on event save.
    // EventForm auto-sets defaultTimeAllocationType=HACK_TIME when event type is Flock. Hack Day.
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_click_add_event(page);
    await When_I_fill_event_form(page, {
      description: 'PW Test Hack Day',
      budget: '500',
      eventType: 'Flock. Hack Day',
      from: `${currentYear}-12-30`,
      to: `${currentYear}-12-30`,
    });
    await When_I_add_participant(page, 'Pino');
    await When_I_submit_event_form(page);
    await Then_event_list_contains(page, 'PW Test Hack Day');
  });

  test('EVNT-04: Event allocations reflected in participant budget summaries', async ({
    page,
  }) => {
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Hack hours: baseline=16h + 8h auto-created = 24h used, available=136h (deterministic)
    await Then_summary_card_shows(page, 'Hack Hours', '136h', '160h', '24h');

    // Training hours unchanged (baseline: 0h used)
    await Then_summary_card_shows(page, 'Training Hours', '200h', '200h', '0h');

    // Training money: used increased by €500 (event budget / 1 participant)
    await Then_money_used_changed_by(
      page,
      'Training Money',
      pinoMoneyBaseline,
      500,
      '€5.000',
    );

    await Then_budget_tab_shows_event_allocation(page, 'Hack Time', '8h');

    await expect(
      page.getByText('Event allocations are managed from the Events page'),
    ).toBeVisible();
  });

  test('EVNT-05: defaultTimeAllocationType persists after reopen', async ({
    page,
  }) => {
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    // Dropdown should show "Hack Time" (persisted by backend).
    const control = page
      .locator('.MuiFormControl-root')
      .filter({ hasText: 'Default Time Allocation Type' })
      .first();
    await expect(control.getByRole('combobox')).toContainText(/Hack Time/i);
  });

  test('EVNT-06: Collapsed budget banner shows assigned and unassigned amounts', async ({
    page,
  }) => {
    // Opens the event created by EVNT-01.
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    // "PW Test Hack Day" was created with budget=500 and 1 participant (Pino).
    // Backend syncs: totalAllocated=500, participantCount=1
    // assignedPerPerson = 500 / 1 = 500, unassigned = 500 - 500 = 0 (fully allocated)
    // Expected banner text: "assigned €500/person, €0 unassigned (fully allocated)"
    await Then_collapsed_banner_shows_money_summary(
      page,
      'assigned €500/person',
      '€0 unassigned (fully allocated)',
    );
  });
});

test.describe('Event Workflow - Modify Allocations', () => {
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

  // Override must survive the backend's re-sync to defaults on save (money stays backend-managed).
  test('EVNT-02: Per-person hour overrides persist across reopen', async ({
    page,
  }) => {
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    await When_I_expand_budget_accordion(page);
    await When_I_expand_time_accordion(page);
    await When_I_ensure_participant_customized(page, 'Pino');
    await When_I_customize_participant_hours(page, 'Pino', 'Hack Time', 0, '4');

    await When_I_save_event(page);

    await When_I_open_event_by_description(page, 'PW Test Hack Day');
    await When_I_expand_budget_accordion(page);
    await When_I_expand_time_accordion(page);
    await Then_participant_hours_equals(page, 'Pino', 'Hack Time', 0, '4');
  });

  test('EVNT-03: Add and remove participants from event allocations', async ({
    page,
  }) => {
    // Baseline captured before adding Ieniemienie.
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Ieniemienie');
    const ieniemoneyBaseline = await readCardUsedValue(page, 'Training Money');

    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    await When_I_add_second_participant(page, 'Ieniemienie Mouse');

    // Save — backend auto-creates allocations for Ieniemienie
    await When_I_submit_event_form(page);

    // Hack hours: baseline=40h + 8h = 48h used, avail=112h (deterministic)
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Ieniemienie');
    await Then_summary_card_shows(page, 'Hack Hours', '112h', '160h', '48h');

    // Training money: used increased by €250 (500/2 participants)
    await Then_money_used_changed_by(
      page,
      'Training Money',
      ieniemoneyBaseline,
      250,
      '€5.000',
    );

    await Then_budget_tab_shows_event_allocation(page, 'Hack Time', '8h');

    // Baseline captured before removing Pino.
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    const pinoMoneyBeforeRemoval = await readCardUsedValue(
      page,
      'Training Money',
    );

    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    await When_I_remove_participant_from_event(page, 'Pino Woodpecker');

    // Save — backend deletes Pino's allocations (cascade)
    await When_I_submit_event_form(page);

    // Pino's hack hours revert to baseline (deterministic).
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    await Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h');

    // Training money: verify used decreased by €250 (Pino's share removed)
    // Note: after Part A, Pino's share went from €500 (1 person) to €250 (2 people).
    // Removing Pino deletes their €250 allocation entirely.
    await Then_money_used_changed_by(
      page,
      'Training Money',
      pinoMoneyBeforeRemoval,
      -250,
      '€5.000',
    );
  });
});
