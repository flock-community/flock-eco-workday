/**
 * Phase 14-01-02 (BUG-01) — Nyquist adversarial test
 *
 * Requirement: onBudgetStateChange must NOT be in the useEffect dependency array.
 * Observable behavior: replacing the callback reference (parent re-render) must NOT
 * trigger an additional onBudgetStateChange call when data has not changed.
 *
 * If the dep array still contained onBudgetStateChange, the effect would re-fire on
 * every parent re-render that creates a new function reference — recreating the
 * infinite loop. This test can fail if the dep array regression is reintroduced.
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import { EventBudgetManagementSection } from './EventBudgetManagementDialog';

// Minimal valid formValues that produce NO sub-sections (no time, no money).
// type=GENERAL_EVENT → showMoneySection=false
// defaultTimeAllocationType=null → showTimeSection=false
// This keeps the render surface minimal and avoids sub-component complexity.
const makeFormValues = () => ({
  budget: 0,
  defaultTimeAllocationType: null,
  personIds: [],
  from: dayjs('2026-06-01'),
  to: dayjs('2026-06-01'),
  days: [8],
  type: 'GENERAL_EVENT',
});

const PERSONS: Array<{ uuid: string; firstname: string; lastname: string }> = [];

describe('EventBudgetManagementSection — notify-parent useEffect dep array stability', () => {
  it('does not call onBudgetStateChange again when only the callback reference changes', async () => {
    const callback1 = jest.fn();
    const formValues = makeFormValues();

    const { rerender } = render(
      <EventBudgetManagementSection
        formValues={formValues}
        persons={PERSONS}
        onBudgetStateChange={callback1}
      />
    );

    // Allow all effects to settle after initial render
    await act(async () => {});

    const callCountAfterMount = callback1.mock.calls.length;

    // Provide a brand-new function reference with identical semantics
    // This simulates a parent re-render that recreates an inline arrow function.
    const callback2 = jest.fn();

    await act(async () => {
      rerender(
        <EventBudgetManagementSection
          formValues={formValues}
          persons={PERSONS}
          onBudgetStateChange={callback2}
        />
      );
    });

    // callback1 must not have been called any additional times after rerender
    // (it was replaced, so any additional calls would go to callback2)
    expect(callback1.mock.calls.length).toBe(callCountAfterMount);

    // callback2 must NOT have been called at all — no data changed, only the ref
    // This is the critical assertion: if onBudgetStateChange were in the dep array,
    // the effect would fire with the new callback and this would be > 0.
    expect(callback2.mock.calls.length).toBe(0);
  });

  it('does call onBudgetStateChange when actual data changes (moneyParticipants)', async () => {
    // Sanity-check: the effect DOES fire for real data changes.
    // Uses a FLOCK_HACK_DAY + personIds to trigger the participant sync effect,
    // which updates moneyParticipants state, which triggers the notify-parent effect.
    const callback = jest.fn();

    const formValuesNoPerson = {
      budget: 1000,
      defaultTimeAllocationType: null,
      personIds: [] as string[],
      from: dayjs('2026-06-01'),
      to: dayjs('2026-06-01'),
      days: [8],
      type: 'FLOCK_HACK_DAY',
    };

    const { rerender } = render(
      <EventBudgetManagementSection
        formValues={formValuesNoPerson}
        persons={[{ uuid: 'p1', firstname: 'Alice', lastname: 'Smith' }]}
        onBudgetStateChange={callback}
      />
    );

    await act(async () => {});

    const callCountBefore = callback.mock.calls.length;

    // Add a participant — triggers participant sync → moneyParticipants changes → effect fires
    await act(async () => {
      rerender(
        <EventBudgetManagementSection
          formValues={{ ...formValuesNoPerson, personIds: ['p1'] }}
          persons={[{ uuid: 'p1', firstname: 'Alice', lastname: 'Smith' }]}
          onBudgetStateChange={callback}
        />
      );
    });

    // Effect must have fired at least once more due to data change
    expect(callback.mock.calls.length).toBeGreaterThan(callCountBefore);
  });
});
