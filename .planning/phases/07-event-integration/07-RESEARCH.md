# Phase 7: Event Integration - Research

**Researched:** 2026-03-12
**Domain:** Frontend event dialog wiring to budget allocation API
**Confidence:** HIGH

## Summary

Phase 7 connects the existing event budget management UI (built in Phase 2 as a frontend-only prototype) to the real budget allocation API (built in Phase 5). The EventDialog already contains the EventBudgetManagementSection with per-participant time and money allocation forms, complete with dirty tracking, progressive disclosure, and reactive updates. However, all budget state currently lives only in React state and is logged to the console on save (see `handleSubmit` in EventDialog.tsx line 80-93). The core work is: (1) load existing allocations from the API when an event is opened, (2) save/update/delete allocations through the API when the event is saved, and (3) implement smart defaults based on event type.

The BudgetAllocationClient already has `findAll(personId?, year?, eventCode?)` for loading and `createStudyMoney`, plus the wirespec defines create/update endpoints for all three allocation types (HackTime, StudyTime, StudyMoney). The client needs to be extended with `createHackTime`, `createStudyTime`, `updateHackTime`, `updateStudyTime`, and `updateStudyMoney` methods. The data transformation layer must convert between the UI's `PersonTimeAllocation`/`PersonMoneyAllocation` shapes and the wirespec input types.

**Primary recommendation:** Extend BudgetAllocationClient with missing CRUD methods, then wire EventDialog's handleSubmit to persist allocations via the API, and load existing allocations when opening an event. Keep the existing EventBudgetManagementSection UI unchanged.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EVT-01 | Event dialog shows budget management section for allocations | Section already exists (EventBudgetManagementSection). Need to load real data from API on open and show it. Currently only renders for `code && eventData` (existing events). |
| EVT-02 | Admin can assign per-participant time allocations with per-day breakdown | EventTimeAllocationSection UI exists with PeriodInput per participant. Need API persistence: transform PersonTimeAllocation to HackTimeAllocationInput/StudyTimeAllocationInput and call create/update endpoints. |
| EVT-03 | Admin can assign per-participant money allocations | EventMoneyAllocationSection UI exists with per-participant amount fields. Need API persistence: transform PersonMoneyAllocation to StudyMoneyAllocationInput and call create/update endpoints. |
| EVT-04 | Smart defaults based on event type (FLOCK_HACK_DAY -> HackTime, CONFERENCE -> StudyTime) | EventTypeMappingToDefaultBudgetType mapping exists in mappings.ts. EventForm auto-sets defaultTimeAllocationType on type change. Need to ensure this flows through to allocation creation with correct BudgetAllocationType. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Already used throughout |
| MUI (Material UI) | 6.x | Component library | Already used (Accordion, Dialog, Grid, etc.) |
| Formik | 2.x | Form state management | Already used in EventDialog |
| dayjs | 2.x | Date handling | Already used for event dates |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| BudgetAllocationClient | N/A | Budget API client | All budget CRUD operations |
| EventClient | N/A | Event API client | Loading event data |
| Wirespec types | Generated | Type-safe API types | All API request/response typing |

### No New Dependencies Needed
This phase requires no new libraries. Everything is built on existing infrastructure.

## Architecture Patterns

### Current Component Hierarchy (Unchanged)
```
EventDialog.tsx
  +-- EventFormFields (Formik form)
  +-- EventBudgetManagementSection (accordion wrapper)
       +-- EventBudgetSummaryBanner (collapsed summary)
       +-- EventTimeAllocationSection (accordion)
       |    +-- ParticipantTimeRow[] (per-participant with PeriodInput)
       +-- EventMoneyAllocationSection (accordion)
            +-- Per-participant amount TextField[]
```

### Pattern 1: Load-on-Open, Save-on-Submit
**What:** When EventDialog opens with an event code, fetch existing budget allocations for that event via `BudgetAllocationClient.findAll(undefined, undefined, eventCode)`. Transform API responses into the UI state shapes (`PersonTimeAllocation[]`, `PersonMoneyAllocation[]`). On form submit, diff current state against loaded state to determine creates/updates/deletes.
**When to use:** Always for existing events (when `code` is present).

### Pattern 2: UI State to API Input Transformation
**What:** The UI uses `PersonTimeAllocation` (with `studyPeriod`/`hackPeriod` as Period objects containing `from`, `to`, `days[]`) and `PersonMoneyAllocation` (with `amount`). The API expects `HackTimeAllocationInput`/`StudyTimeAllocationInput` (with `dailyAllocations: DailyTimeAllocationItem[]`) and `StudyMoneyAllocationInput` (with `amount`).

**Key transformation: Period -> DailyTimeAllocationItem[]**
```typescript
// PersonTimeAllocation.hackPeriod = { from: Dayjs, to: Dayjs, days: [8, 8, 4] }
// needs to become:
// HackTimeAllocationInput.dailyAllocations = [
//   { date: "2026-03-10", hours: 8, type: "HACK" },
//   { date: "2026-03-11", hours: 8, type: "HACK" },
//   { date: "2026-03-12", hours: 4, type: "HACK" },
// ]
```

### Pattern 3: EventBudgetType to BudgetAllocationType Mapping
**What:** The event form uses `EventBudgetType` values (`"STUDY"`, `"HACK"`) while the API uses `BudgetAllocationType` (`"HACK_TIME"`, `"STUDY_TIME"`, `"STUDY_MONEY"`) and `DailyAllocationType` (`"STUDY"`, `"HACK"`).

**Mapping:**
- `EventBudgetType.STUDY` -> `BudgetAllocationType.STUDY_TIME` (for API type) + `DailyAllocationType.STUDY` (for daily items)
- `EventBudgetType.HACK` -> `BudgetAllocationType.HACK_TIME` (for API type) + `DailyAllocationType.HACK` (for daily items)
- Money allocations always use `BudgetAllocationType.STUDY_MONEY`

### Pattern 4: Diff-Based Save Strategy
**What:** On submit, compare loaded allocations (from API) against current UI state. For each participant:
- If allocation exists in API but not in UI state -> DELETE
- If allocation exists in UI state but not in API -> CREATE
- If allocation exists in both and changed -> UPDATE
- If allocation exists in both and unchanged -> SKIP

**Why:** Prevents duplicate allocations and handles participant add/remove during editing.

### Pattern 5: Default Allocation Generation for New Events
**What:** For participants without custom allocations (using defaults), generate allocations based on `defaultTimeAllocationType` and event dates. Each day of the event gets a `DailyTimeAllocationItem` with the default hours per day and the default type.

### Anti-Patterns to Avoid
- **Saving all allocations as new on every submit:** Would create duplicates. Must diff against loaded state.
- **Saving budget state independently from event save:** Budget and event should save atomically (or at least sequentially) to avoid orphaned allocations for unsaved events.
- **Modifying EventBudgetManagementSection UI:** The UI is complete from Phase 2. Only change the data flow (loading initial state, transforming for save).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Budget allocation CRUD | Custom fetch calls | Extend BudgetAllocationClient | Consistent error handling, type safety |
| Period to DailyTimeAllocationItem conversion | Inline transformation in submit handler | Dedicated transformer function | Reusable, testable, handles edge cases |
| Dirty tracking / diff detection | Manual comparison logic | Compare loaded IDs vs current IDs | Simple set operations |

## Common Pitfalls

### Pitfall 1: Race Condition Between Event Save and Budget Save
**What goes wrong:** Event save returns event code needed for budget allocation `eventCode` field. If saving budget before event completes, eventCode may be undefined for new events.
**Why it happens:** Budget allocations need `eventCode` which only exists after event is created.
**How to avoid:** Save event first, then save budget allocations using the returned event code. For existing events, the code is already known.
**Warning signs:** Budget allocations with null eventCode in database.

### Pitfall 2: Default vs Custom Allocation Ambiguity
**What goes wrong:** UI shows "using defaults" for participants without custom allocations, but the API has no concept of "defaults" -- every allocation is explicit.
**Why it happens:** The UI infers default allocations from event dates + defaultTimeAllocationType, but these must be materialized as real API records.
**How to avoid:** On save, generate explicit allocation records for ALL participants (both default and custom). On load, mark loaded allocations that match the computed defaults as "not dirty."
**Warning signs:** Participants "using defaults" don't have allocations persisted.

### Pitfall 3: EventBudgetType vs BudgetAllocationType Confusion
**What goes wrong:** Passing `"STUDY"` or `"HACK"` (EventBudgetType) to the API which expects `"STUDY_TIME"` or `"HACK_TIME"` (BudgetAllocationType).
**Why it happens:** Two different enum/const sets exist for similar concepts (Decision #29 in STATE.md).
**How to avoid:** Create an explicit mapping function. Use wirespec types for all API calls. Keep EventBudgetType strictly in UI layer.

### Pitfall 4: Period Days Array Alignment with Event Dates
**What goes wrong:** PeriodInput `days[]` array index doesn't correspond to correct dates when generating DailyTimeAllocationItem records.
**Why it happens:** The days array is positional (index 0 = first day of event), and dates must be calculated from event's `from` date.
**How to avoid:** Always derive dates from `from.add(index, 'day')` when creating DailyTimeAllocationItem records.

### Pitfall 5: Missing Budget Section for New Events
**What goes wrong:** Budget management section only shows for existing events (`code && eventData` guard on line 178 of EventDialog.tsx).
**Why it happens:** New events don't have a code yet, so can't load or save allocations.
**How to avoid:** This is actually correct behavior for v1. Budget allocations require a saved event with a code. The flow is: create event -> reopen event -> manage budgets. Document this as expected behavior.

### Pitfall 6: Deleting Allocations When Participants Are Removed
**What goes wrong:** If admin removes a participant from the event, their budget allocations become orphaned.
**Why it happens:** Event participant list and budget allocations are managed separately.
**How to avoid:** On save, detect removed participants (present in loaded allocations but not in current form) and delete their allocations.

## Code Examples

### Extending BudgetAllocationClient
```typescript
// Source: Pattern from existing createStudyMoney in BudgetAllocationClient.ts
const createHackTime = async (
  input: HackTimeAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/hack-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create hack time allocation: ${res.status}`);
  return res.json();
};

const updateHackTime = async (
  id: string,
  input: HackTimeAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/hack-time/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update hack time allocation: ${res.status}`);
  return res.json();
};
// Similarly for createStudyTime, updateStudyTime, updateStudyMoney
```

### Period to DailyTimeAllocationItem Transformation
```typescript
// Source: Derived from wirespec types + Period type in Period.ts
import type { DailyTimeAllocationItem, DailyAllocationType } from '../wirespec/model';
import type { Period } from '../features/period/Period';

function periodToDailyAllocations(
  period: Period,
  type: DailyAllocationType,
): DailyTimeAllocationItem[] {
  if (!period.days) return [];
  return period.days
    .map((hours, index) => ({
      date: period.from.add(index, 'day').format('YYYY-MM-DD'),
      hours,
      type,
    }))
    .filter(item => item.hours > 0); // Only include days with hours
}
```

### Loading Existing Allocations into UI State
```typescript
// Source: Derived from BudgetAllocation wirespec type + PersonTimeAllocation type
function apiAllocationsToTimeParticipants(
  allocations: BudgetAllocation[],
  persons: Person[],
  eventFrom: Dayjs,
  eventTo: Dayjs,
): PersonTimeAllocation[] {
  // Group allocations by personId
  const byPerson = new Map<string, BudgetAllocation[]>();
  allocations
    .filter(a => a.type === 'HACK_TIME' || a.type === 'STUDY_TIME')
    .forEach(a => {
      const list = byPerson.get(a.personId) || [];
      list.push(a);
      byPerson.set(a.personId, list);
    });

  return persons.map(person => {
    const personAllocations = byPerson.get(person.uuid) || [];
    const hackAlloc = personAllocations.find(a => a.type === 'HACK_TIME');
    const studyAlloc = personAllocations.find(a => a.type === 'STUDY_TIME');

    return {
      personId: person.uuid,
      personName: `${person.firstname} ${person.lastname}`,
      hackPeriod: hackAlloc?.hackTimeDetails
        ? dailyAllocationsToPeriod(hackAlloc.hackTimeDetails.dailyAllocations, eventFrom, eventTo)
        : null,
      studyPeriod: studyAlloc?.studyTimeDetails
        ? dailyAllocationsToPeriod(studyAlloc.studyTimeDetails.dailyAllocations, eventFrom, eventTo)
        : null,
    };
  });
}
```

### Smart Default Type Mapping
```typescript
// Source: mappings.ts EventTypeMappingToDefaultBudgetType + wirespec BudgetAllocationType
function eventBudgetTypeToAllocationType(
  budgetType: EventBudgetType,
): 'HACK_TIME' | 'STUDY_TIME' {
  return budgetType === 'HACK' ? 'HACK_TIME' : 'STUDY_TIME';
}

function eventBudgetTypeToDailyType(
  budgetType: EventBudgetType,
): 'HACK' | 'STUDY' {
  return budgetType; // They happen to match: EventBudgetType.HACK = "HACK", DailyAllocationType = "HACK"
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Console.log budget on save | Persist via API | Phase 7 (now) | Budget data actually persists |
| Budget section only shows for existing events | Same (correct behavior) | Phase 2 | New events must be saved first before budget management |
| Mock BudgetAllocationType in UI | EventBudgetType constant | Phase 6 (Decision #29) | Separate UI and API type enums |
| EventBudgetAllocationDialog prototype | Deleted in Phase 6 | Phase 6 (Decision #30) | Phase 7 rebuilds event integration from scratch |

## Key Files to Modify

| File | Change | Purpose |
|------|--------|---------|
| `BudgetAllocationClient.ts` | Add createHackTime, createStudyTime, updateHackTime, updateStudyTime, updateStudyMoney | Complete CRUD client |
| `EventDialog.tsx` | Load allocations on open, save allocations on submit | Wire UI to API |
| `EventBudgetManagementSection.tsx` | Accept initial allocation state, expose save-ready state | Support loaded data |
| New: `eventBudgetTransformers.ts` | Period<->DailyTimeAllocationItem conversion, diff logic | Data transformation layer |

## Open Questions

1. **Should default allocations be auto-created for all participants, or only when admin explicitly saves?**
   - What we know: UI shows "using defaults" for participants without custom allocations. Defaults are derived from event type and hours.
   - What's unclear: Should these defaults be materialized as API records on first save, or only when admin customizes them?
   - Recommendation: Materialize all defaults on save. This ensures budget tracking is complete and budget summary calculations are accurate.

2. **How to handle budget section for new (unsaved) events?**
   - What we know: Current guard (`code && eventData`) prevents budget section from showing on new events.
   - What's unclear: Should we show budget section for new events too (save budget after event creation)?
   - Recommendation: Keep current behavior. Admin creates event first, then manages budgets on reopen. This avoids the race condition of needing an event code for allocations.

## Sources

### Primary (HIGH confidence)
- EventDialog.tsx - Current event dialog implementation with budget section
- BudgetAllocationClient.ts - Existing API client methods
- budget-allocations.ws - Wirespec API contract definitions
- BudgetAllocationController.kt - Backend endpoint implementations
- EventBudgetManagementSection.tsx - Budget UI with dirty tracking
- EventTimeAllocationSection.tsx - Per-participant time allocation UI
- EventMoneyAllocationSection.tsx - Per-participant money allocation UI
- mappings.ts - EventBudgetType and EventType mappings

### Secondary (MEDIUM confidence)
- STATE.md decisions #29, #30 - Architectural decisions about type separation and prototype deletion

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed, all patterns established in codebase
- Architecture: HIGH - All components exist, only data flow wiring needed
- Pitfalls: HIGH - Based on direct code analysis of existing types and data shapes

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable codebase, no external dependencies changing)
