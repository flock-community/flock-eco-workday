// Event workflow e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false). Order matters: create -> verify budget impact.
// Admin user: bert. Target participant: pino@sesam.straat.
//
// Dev data baselines (current year, from develop seed data):
//   Pino contract: hackHours=160, studyHours=100, studyMoney=EUR2500
//     Seed allocations: hackUsed=16h (Hack Day - March), studyUsed=0h, moneyUsed=€0
//   Ieniemienie contract: hackHours=160, studyHours=200, studyMoney=EUR5000
//     Seed allocations: hackUsed=40h (Hack Day - Feb), studyUsed=24h, moneyUsed=€500
//
// Test creates a FLOCK_HACK_DAY event with 1 day, 8h, Pino as participant.
// Two-step flow: first create event (no budget section on create), then reopen to configure budgets.
// After EVNT-01 save: Pino gains 8h hack time allocation on top of seed baseline.
// Expected summary after: Hack(budget=160, used=24h, avail=136h)

import { test, expect } from '@playwright/test';
import {
  Given_I_am_on_events_page,
  When_I_click_add_event,
  When_I_fill_event_form,
  When_I_add_participant,
  When_I_submit_event_form,
  When_I_open_event_by_description,
  When_I_expand_budget_accordion,
  When_I_expand_time_accordion,
  When_I_click_show_all_participants,
  When_I_customize_participant_allocation,
  When_I_save_event,
  Then_event_list_contains,
  Then_budget_tab_shows_event_allocation,
  When_I_customize_participant_hours,
  When_I_remove_participant_from_event,
  When_I_add_second_participant,
  When_I_set_default_time_allocation_type,
} from './steps/eventSteps';
import {
  Given_I_am_on_budget_tab_for_person,
  Then_summary_card_shows,
} from './steps/budgetSteps';

const currentYear = new Date().getFullYear();

/**
 * Clean up any leftover "PW Test Hack Day" events from previous test runs.
 * Uses Playwright browser context to authenticate and call APIs.
 */
async function cleanupTestEvents(browser: import('@playwright/test').Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    // Login via the UI
    await page.goto('/auth');
    await page.getByLabel('Username').fill('bert@sesam.straat');
    await page.getByLabel('Password').fill('bert');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/*');

    // Use page.evaluate to call APIs with the authenticated session
    await page.evaluate(async () => {
      const eventsRes = await fetch('/api/events?page=0&size=100&sort=from,desc');
      if (!eventsRes.ok) return;
      const eventsData = await eventsRes.json();
      const events = eventsData.content || eventsData;
      for (const event of events) {
        if (event.description === 'PW Test Hack Day') {
          // Delete allocations linked to this event
          const allocRes = await fetch(`/api/budget-allocations?eventCode=${event.code}`);
          if (allocRes.ok) {
            const allocations = await allocRes.json();
            for (const alloc of allocations) {
              await fetch(`/api/budget-allocations/${alloc.id}`, { method: 'DELETE' });
            }
          }
          // Delete the event
          await fetch(`/api/events/${event.code}`, { method: 'DELETE' });
        }
      }
    });
  } catch {
    // Cleanup is best-effort; tests are designed for a clean database
  } finally {
    await context.close();
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

  test('EVNT-01: Create event with budget allocations for participant', async ({ page }) => {
    // Step 1: Create the event (budget section not available on create)
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_click_add_event(page);
    await When_I_fill_event_form(page, {
      description: 'PW Test Hack Day',
      budget: '500',
      eventType: 'Flock. Hack Day',
      from: `${currentYear}-07-15`,
      to: `${currentYear}-07-15`,
    });
    await When_I_add_participant(page, 'Pino');
    await When_I_submit_event_form(page);
    await Then_event_list_contains(page, 'PW Test Hack Day');

    // Step 2: Reopen event to configure budgets
    await When_I_open_event_by_description(page, 'PW Test Hack Day');
    // Backend doesn't persist defaultTimeAllocationType — must set it after reopening
    await When_I_set_default_time_allocation_type(page, 'Hack Time');
    await When_I_expand_budget_accordion(page);
    await When_I_expand_time_accordion(page);
    await When_I_click_show_all_participants(page);

    // Pino should be visible with default allocation (using defaults)
    // Scope to the AccordionDetails to avoid matching "Pino" in the event list behind the dialog
    const timeAccordionDetails = page.locator('.MuiAccordionDetails-root').filter({ hasText: 'participant' }).first();
    await expect(timeAccordionDetails.getByText('Pino').first()).toBeVisible();

    // Click "Customize" on Pino's row to materialize the default allocation
    // Without this, diffAllocations would not create any API allocation
    await When_I_customize_participant_allocation(page, 'Pino');

    // Save the event with the materialized allocation
    await When_I_save_event(page);
  });

  test('EVNT-04: Event allocations reflected in participant budget summaries', async ({ page }) => {
    // Navigate to Pino's budget tab
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Verify hack hours summary updated:
    // Seed baseline: 16h used. After EVNT-01 creates 8h hack allocation: used=24h, avail=136h.
    await Then_summary_card_shows(page, 'Hack Hours', '136h', '160h', '24h');

    // Verify study hours unchanged (seed: 0h used)
    await Then_summary_card_shows(page, 'Study Hours', '100h', '100h', '0h');

    // Verify study money unchanged (seed: €0 used)
    await Then_summary_card_shows(page, 'Study Money', '€2.500', '€2.500', '€0');

    // Verify event allocation appears in the allocation list
    await Then_budget_tab_shows_event_allocation(page, 'Hack Time', '8h');

    // Verify the info alert about event allocations
    await expect(
      page.getByText('Event allocations are managed from the Events page'),
    ).toBeVisible();
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

  test('EVNT-02: Modify event allocation hours per day', async ({ page }) => {
    // Reopen the "PW Test Hack Day" event created by EVNT-01
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    // Backend doesn't persist defaultTimeAllocationType — must set it after reopening
    await When_I_set_default_time_allocation_type(page, 'Hack Time');

    // Expand the budget sections
    await When_I_expand_budget_accordion(page);
    await When_I_expand_time_accordion(page);

    // Saved allocation matches default (8h/day) so UI shows "using defaults" after reopen.
    // Must show all participants and re-customize before modifying hours.
    await When_I_click_show_all_participants(page);
    await When_I_customize_participant_allocation(page, 'Pino');

    // Change Pino's hack hours from 8h to 4h for the single day (index 0).
    await When_I_customize_participant_hours(page, 'Pino', 'Hack Time', 0, '4');

    // Save the event with modified allocation
    await When_I_save_event(page);

    // Verify the change persisted on Pino's budget tab
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');

    // Seed: 16h used. Was: 24h (seed+8h from EVNT-01). After edit to 4h: used=20h, avail=140h.
    await Then_summary_card_shows(page, 'Hack Hours', '140h', '160h', '20h');

    // Verify study hours unchanged (seed: 0h)
    await Then_summary_card_shows(page, 'Study Hours', '100h', '100h', '0h');
  });

  test('EVNT-03: Add and remove participants from event allocations', async ({ page }) => {
    // --- Part A: Add Ieniemienie as a second participant ---
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    // Add Ieniemienie to the event via the Person multi-select
    await When_I_add_second_participant(page, 'Ieniemienie Mouse');

    // Save the form first so the server knows about the new participant
    // Then reopen to configure budgets (budget section uses server-side persons)
    await When_I_submit_event_form(page);
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    // Backend doesn't persist defaultTimeAllocationType — must set it after reopening
    await When_I_set_default_time_allocation_type(page, 'Hack Time');

    // Expand budget sections and show all participants
    await When_I_expand_budget_accordion(page);
    await When_I_expand_time_accordion(page);
    await When_I_click_show_all_participants(page);

    // Verify Ieniemienie appears in the time allocation section
    await expect(page.getByText('Ieniemienie Mouse').first()).toBeVisible();

    // Click "Customize" on Ieniemienie's row to materialize the default allocation
    await When_I_customize_participant_allocation(page, 'Ieniemienie');

    // Save the event with the new participant's allocation
    await When_I_save_event(page);

    // Verify on Ieniemienie's budget tab
    // Contract: hackHours=160, studyHours=200, studyMoney=5000
    // Seed baseline: hack=40h. After adding 8h hack from PW Test Hack Day: hack used=48h, avail=112h
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Ieniemienie');
    await Then_summary_card_shows(page, 'Hack Hours', '112h', '160h', '48h');

    // Verify the event allocation appears in the list
    await Then_budget_tab_shows_event_allocation(page, 'Hack Time', '8h');

    // --- Part B: Remove Pino from the event ---
    await Given_I_am_on_events_page(page, 'bert');
    await When_I_open_event_by_description(page, 'PW Test Hack Day');

    // Remove Pino from the Person multi-select
    await When_I_remove_participant_from_event(page, 'Pino Woodpecker');

    // Save the event (this removes Pino's allocation server-side)
    await When_I_submit_event_form(page);

    // Verify Pino's hack hours reverted (event allocation removed)
    // Seed baseline: hack=16h. After removing test event: back to seed only, used=16h, avail=144h
    await Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino');
    await Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h');
  });
});
