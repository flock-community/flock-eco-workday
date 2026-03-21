// Event workflow e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false). Order matters: create -> verify budget impact.
// Admin user: bert. Target participant: pino@sesam.straat.
//
// Dev data for pino (current year):
//   Contract: hackHours=160, studyHours=100, studyMoney=EUR2500
//   Existing allocations: 1 HackTime event-linked (16h, "Hack Day - March")
//   Summary before test: Hack(budget=160, used=16h, avail=144h), Study(budget=100, used=0, avail=100h), Money(budget=2500, used=0, avail=2500)
//
// Test creates a FLOCK_HACK_DAY event with 1 day, 8h, Pino as participant.
// Two-step flow: first create event (no budget section on create), then reopen to configure budgets.
// After save: Pino gains an additional 8h hack time allocation.
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
} from './steps/eventSteps';
import {
  Given_I_am_on_budget_tab_for_person,
  Then_summary_card_shows,
} from './steps/budgetSteps';

const currentYear = new Date().getFullYear();

test.describe('Event Workflow - Create and Budget Verification', () => {
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
    await When_I_expand_budget_accordion(page);
    await When_I_expand_time_accordion(page);
    await When_I_click_show_all_participants(page);

    // Pino should be visible with default allocation (using defaults)
    await expect(page.getByText('Pino')).toBeVisible();

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
    // Was: used=16h (from dev data "Hack Day - March"). Now: used=16+8=24h. Available: 160-24=136h.
    await Then_summary_card_shows(page, 'Hack Hours', '136h', '160h', '24h');

    // Verify study hours unchanged
    await Then_summary_card_shows(page, 'Study Hours', '100h', '100h', '0h');

    // Verify study money unchanged
    await Then_summary_card_shows(page, 'Study Money', '€2.500', '€2.500', '€0');

    // Verify event allocation appears in the allocation list
    await Then_budget_tab_shows_event_allocation(page, 'Hack Time', '8h');

    // Verify the info alert about event allocations
    await expect(
      page.getByText('Event allocations are managed from the Events page'),
    ).toBeVisible();
  });
});
