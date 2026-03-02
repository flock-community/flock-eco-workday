---
status: investigating
trigger: "Removing persons from an event doesn't remove them from the money budget section, and no redistribution of the budget happens."
created: 2026-03-02T00:00:00Z
updated: 2026-03-02T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED - Two competing useEffects in EventBudgetManagementDialog.tsx both fire when participantIds changes. The second useEffect (line 140) reads stale moneyParticipants (still including removed person) and overwrites the correctly-filtered result from the first useEffect (line 74). Additionally, the first useEffect preserves existing allocations rather than redistributing.
test: Confirmed via code analysis of React effect ordering and stale closure behavior
expecting: N/A - root cause confirmed
next_action: Document root cause and return diagnosis

## Symptoms

expected: When a person is removed from the event participant list, they should also be removed from the money budget section, and remaining budget should be redistributed among remaining participants
actual: Removed persons remain in the money budget section, and no redistribution occurs
errors: None reported
reproduction: Remove a person from event participants while budget management section is visible
started: Since budget management was implemented

## Eliminated

## Evidence

- timestamp: 2026-03-02T00:00:30Z
  checked: Data flow from PersonSelectorField through Formik to EventBudgetManagementSection
  found: PersonSelectorField calls setFieldValue which creates new array reference; formik.values.personIds is passed correctly as formValues to EventBudgetManagementSection
  implication: The participantIds variable does get updated correctly when persons are removed

- timestamp: 2026-03-02T00:00:40Z
  checked: UseEffect 1 (line 74) - participant sync logic
  found: Iterates over new participantIds and preserves existing allocations via currentMoneyMap.get(personId). Removed persons are filtered out correctly. However, existing participants keep their old amounts - no redistribution.
  implication: Effect 1 correctly filters but does not redistribute budget

- timestamp: 2026-03-02T00:00:50Z
  checked: UseEffect 2 (line 140) - budget recalculation logic
  found: Depends on [totalBudget, participantIds.length]. Reads moneyParticipants from closure (stale in same render cycle). Recalculates shares but uses stale participant list that still includes removed person.
  implication: Effect 2 overwrites Effect 1's filtered result with stale data

- timestamp: 2026-03-02T00:01:00Z
  checked: React effect ordering and batching behavior
  found: Both effects fire in same commit phase. Both read same stale moneyParticipants. Effect 2 runs after Effect 1. Last setMoneyParticipants wins, so Effect 2's stale-data update overwrites Effect 1's correctly-filtered update.
  implication: ROOT CAUSE CONFIRMED - competing useEffects with stale closure

## Resolution

root_cause: Two competing useEffects in EventBudgetManagementDialog.tsx both fire when participantIds changes; the second (line 140, budget recalculation) reads stale moneyParticipants from the closure that still includes the removed person, and its setMoneyParticipants call overwrites the correctly-filtered result from the first useEffect (line 74). Additionally, the first useEffect preserves existing allocations for remaining participants rather than redistributing.
fix:
verification:
files_changed: []
