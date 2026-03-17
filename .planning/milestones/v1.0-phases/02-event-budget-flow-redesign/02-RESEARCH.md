# Phase 2: Event Budget Flow Redesign - Research

**Researched:** 2026-03-02
**Domain:** React Form State Management, Formik Integration, Progressive Disclosure UX
**Confidence:** HIGH

## Summary

Phase 2 addresses the disconnected flow between EventForm fields and budget management sections through React state lifting and Formik integration patterns. The research confirms that the existing codebase already has all necessary building blocks (EventBudgetSummaryBanner, EventBudgetParticipantRow, ConfirmDialog, Formik patterns) and follows consistent React patterns (useState/useEffect for local state, Formik for form state).

The key technical challenge is refactoring EventDialog to lift Formik state up from EventForm so that budget sections can reactively consume form values (costs, defaultTimeAllocationType, from, to, days, personIds) as props. This is a standard React state management pattern already used throughout the codebase.

**Primary recommendation:** Use Formik at EventDialog level (not EventForm level) to enable single source of truth, implement progressive disclosure with collapsed-by-default MUI Accordion, add dirty state tracking per-participant for "update if untouched" behavior, and consolidate save logic into a single dialog-level save button.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single save button saves event details AND budget allocations together
- Budget sections only appear when editing existing events (not during creation)
- Individual save buttons removed from time/money accordion sections
- Subtle visual indicator (dot/badge) on Save button or accordion header when unsaved budget changes exist
- Closing the dialog with unsaved budget changes shows a confirmation warning ("You have unsaved budget changes. Close anyway?")
- Money allocations auto-populate with equal split of event budget across participants
- Time allocations auto-fill from event's daily hours and defaultTimeAllocationType (e.g., 8h/day HACK for a Flock Hack Day)
- When admin changes event type (which changes defaultTimeAllocationType), untouched participant allocations update to new type; manually edited allocations are preserved
- When a new participant is added to the event, they auto-get allocations matching the current defaults (both time and money)
- Default view: summary banner showing allocation totals (e.g., "5 participants x 8h/day HACK, EUR500/person")
- Click summary banner to expand into full budget management
- Per-day time breakdowns hidden by default; click a specific participant row to expand and see/edit per-day breakdown
- Budget section appears even for events without defaultTimeAllocationType, with a guidance note ("No default allocation type set - set event type to enable auto-fill")

### Claude's Discretion
- Expanded detail view organization (accordions vs. unified participant list vs. tabs)
- Exact summary banner layout and information density
- How the "dirty state" tracking works per-participant for the "update if untouched" behavior
- Specific MUI component choices for unsaved changes indicator

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EVT-05 | Event form budget/type changes live-update the budget management sections (single source of truth) | Formik state lifting pattern (see Architecture Patterns section), React reactive props pattern, useEffect for watching form value changes |
| EVT-06 | Budget management section uses progressive disclosure (start simple, expand on demand) | MUI Accordion collapsed by default, EventBudgetSummaryBanner for collapsed view, EventBudgetParticipantRow expandable pattern already exists |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | UI framework | Codebase uses React 19 with hooks (useState, useEffect) throughout |
| Formik | 2.2.6 | Form state management | Used extensively in codebase (EventForm, WorkDayForm, SickDayForm, etc.) |
| formik-mui | 5.0.0-alpha.0 | MUI integration for Formik | Provides Field components for seamless MUI + Formik integration |
| Yup | 0.27.0 | Schema validation | Used with Formik for form validation across codebase |
| MUI (Material UI) | 7.0.0 | Component library | Primary UI library, Accordion used for collapsible sections |
| dayjs | 1.11.1 | Date manipulation | Used for date handling in event periods |
| TypeScript | 5.2.2 | Type safety | All React files are .tsx with type definitions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mui/icons-material | 7.0.0 | Icons | Visual indicators (dots, badges) for unsaved state |
| @testing-library/react | 16.0.0 | React testing | Unit tests for form behavior (optional for this phase) |
| Jest | 29.7.0 | Test runner | Configured with jsdom for component testing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Formik | React Hook Form | React Hook Form is lighter weight, but codebase standardizes on Formik (20+ forms use it) |
| MUI Accordion | Custom collapse component | MUI Accordion provides built-in expand/collapse state management and animation |
| Per-participant dirty tracking | Form-level dirty flag | Form-level flag simpler but loses granularity for "update untouched allocations" requirement |

**Installation:**
No new dependencies required - all libraries already installed.

## Architecture Patterns

### Recommended Refactoring Structure
```
EventDialog.tsx (top level - owns Formik state)
├── EventForm.tsx (receives formik props, renders fields)
├── EventBudgetManagementSection.tsx (receives form values as props, collapsed by default)
    ├── EventBudgetSummaryBanner.tsx (shows when collapsed)
    ├── EventTimeAllocationSection.tsx (expanded view)
    └── EventMoneyAllocationSection.tsx (expanded view)
```

### Pattern 1: Formik State Lifting (Single Source of Truth)
**What:** Move Formik initialization from EventForm to EventDialog, pass formik props down
**When to use:** When sibling components need to consume form state
**Example:**
```typescript
// Source: EventDialog.tsx (adapted from existing WorkDayDialog pattern)

// BEFORE (current):
// EventDialog has no Formik, EventForm initializes Formik internally
export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [eventData, setEventData] = useState<FullFlockEvent | null>(null);
  return (
    <Dialog>
      <EventForm value={state} onSubmit={handleSubmit} />
      <EventBudgetManagementSection event={eventData} /> {/* Disconnected! */}
    </Dialog>
  );
}

// AFTER (refactored):
// EventDialog owns Formik, both EventForm and budget sections consume it
export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [eventData, setEventData] = useState<FullFlockEvent | null>(null);

  const handleSubmit = (values: EventFormValues) => {
    // Save both event data AND budget allocations together
    saveEventAndBudgets(values);
  };

  return (
    <Dialog>
      <Formik
        initialValues={init}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        {(formik) => (
          <>
            <EventFormFields formik={formik} />
            {code && (
              <EventBudgetManagementSection
                formValues={formik.values}  // Live reactive props
                onBudgetChange={(budgets) => {
                  // Update budget state for save
                }}
              />
            )}
          </>
        )}
      </Formik>
    </Dialog>
  );
}
```

### Pattern 2: Progressive Disclosure with MUI Accordion
**What:** Start with collapsed summary, expand to show details
**When to use:** Information-dense UIs where most users only need summary view
**Example:**
```typescript
// Source: EventBudgetManagementDialog.tsx (already implements this)

// Current implementation already has the right structure:
<Accordion
  expanded={timeExpanded}
  onChange={(_, isExpanded) => setTimeExpanded(isExpanded)}
>
  <AccordionSummary expandIcon={<ExpandMore />}>
    <EventBudgetSummaryBanner /> {/* Summary view */}
  </AccordionSummary>
  <AccordionDetails>
    <EventTimeAllocationSection /> {/* Detail view */}
  </AccordionDetails>
</Accordion>

// Refactor to default collapsed:
const [timeExpanded, setTimeExpanded] = useState(false); // Was true, now false
const [moneyExpanded, setMoneyExpanded] = useState(false);
```

### Pattern 3: Dirty State Tracking for "Update if Untouched"
**What:** Track which participant allocations have been manually edited vs. still using defaults
**When to use:** When some values should auto-update but user edits should be preserved
**Example:**
```typescript
// Source: New pattern for this phase

interface ParticipantBudgetState {
  personId: string;
  moneyAmount: number;
  moneyDirty: boolean; // True if user manually changed
  timeAllocation: PersonTimeAllocation;
  timeDirty: boolean;
}

const [participantStates, setParticipantStates] = useState<ParticipantBudgetState[]>([]);

// When event type changes:
useEffect(() => {
  if (!formik.values.defaultTimeAllocationType) return;

  setParticipantStates((prev) =>
    prev.map((p) => {
      if (p.timeDirty) return p; // User edited - preserve

      // Untouched - update to new defaults
      return {
        ...p,
        timeAllocation: getDefaultTimeAllocation(
          formik.values.defaultTimeAllocationType,
          formik.values.days
        ),
      };
    })
  );
}, [formik.values.defaultTimeAllocationType]);

// When user edits:
const handleTimeChange = (personId: string, newAllocation: PersonTimeAllocation) => {
  setParticipantStates((prev) =>
    prev.map((p) =>
      p.personId === personId
        ? { ...p, timeAllocation: newAllocation, timeDirty: true }
        : p
    )
  );
};
```

### Pattern 4: Unsaved Changes Warning
**What:** Detect dirty state and warn before closing dialog
**When to use:** Forms with complex data where losing changes is costly
**Example:**
```typescript
// Source: Existing ConfirmDialog pattern from workday-core

const [budgetsDirty, setBudgetsDirty] = useState(false);
const [showCloseWarning, setShowCloseWarning] = useState(false);

const handleDialogClose = () => {
  if (budgetsDirty) {
    setShowCloseWarning(true);
  } else {
    onComplete();
  }
};

return (
  <>
    <Dialog onClose={handleDialogClose}>
      {/* Form content */}
    </Dialog>
    <ConfirmDialog
      open={showCloseWarning}
      onClose={() => setShowCloseWarning(false)}
      onConfirm={() => {
        setBudgetsDirty(false);
        onComplete();
      }}
    >
      <Typography>
        You have unsaved budget changes. Close anyway?
      </Typography>
    </ConfirmDialog>
  </>
);
```

### Pattern 5: Auto-Populate New Participants
**What:** When personIds changes, add new participants with default allocations
**When to use:** List management where new items should start with sensible defaults
**Example:**
```typescript
// Source: EventBudgetManagementDialog.tsx useEffect pattern (adapted)

useEffect(() => {
  if (!formik.values.personIds) return;

  const currentPersonIds = new Set(participantStates.map((p) => p.personId));
  const newPersonIds = formik.values.personIds.filter((id) => !currentPersonIds.has(id));

  if (newPersonIds.length > 0) {
    const newParticipants = newPersonIds.map((personId) => ({
      personId,
      moneyAmount: formik.values.budget / formik.values.personIds.length,
      moneyDirty: false,
      timeAllocation: getDefaultTimeAllocation(
        formik.values.defaultTimeAllocationType,
        formik.values.days
      ),
      timeDirty: false,
    }));

    setParticipantStates((prev) => [...prev, ...newParticipants]);
  }
}, [formik.values.personIds]);
```

### Anti-Patterns to Avoid
- **Prop Drilling Through Multiple Levels:** EventDialog should pass formik values directly to budget sections, not through intermediate wrapper components
- **Multiple Sources of Truth:** Budget defaults must derive from formik.values, not duplicate state
- **Uncontrolled Save Buttons:** Remove individual save buttons from accordion sections - single dialog-level save only
- **Premature Expansion:** Don't auto-expand accordions on load - respect progressive disclosure principle

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom form hooks with manual validation | Formik + Yup | Handles validation, touched state, submission, reset - already used in 20+ forms |
| Collapsible sections | Custom CSS transitions | MUI Accordion | Built-in expand/collapse state, keyboard navigation, ARIA attributes |
| Date manipulation | Custom date math | dayjs | Already used throughout codebase, handles edge cases (leap years, DST) |
| Unsaved changes dialog | Custom modal | ConfirmDialog from @workday-core | Consistent UX, reusable component already in codebase |
| Dirty state tracking | Manual change detection | Formik dirty + custom per-participant dirty flags | Formik tracks form-level dirty, extend pattern for allocations |

**Key insight:** React state management problems are solved by lifting state to common ancestor. The codebase already demonstrates this pattern in WorkDayDialog and other dialogs - apply the same approach here.

## Common Pitfalls

### Pitfall 1: Stale Closure in useEffect Dependencies
**What goes wrong:** useEffect reads stale form values when dependencies are incomplete
**Why it happens:** useEffect captures values at render time; missing dependencies mean effect doesn't re-run when values change
**How to avoid:** Always include all values used inside useEffect in dependency array, or use formik.values directly (React guarantees it's stable)
**Warning signs:** Budget sections don't update when form fields change, console warnings about missing dependencies

```typescript
// BAD:
const defaultBudgetType = formik.values.defaultTimeAllocationType;
useEffect(() => {
  // Uses defaultBudgetType from closure - may be stale
  updateAllocations(defaultBudgetType);
}, []); // Missing dependency!

// GOOD:
useEffect(() => {
  // Reads current value directly
  updateAllocations(formik.values.defaultTimeAllocationType);
}, [formik.values.defaultTimeAllocationType]); // Complete dependencies
```

### Pitfall 2: Resetting Formik State on Dialog Open
**What goes wrong:** Budget allocations flash/reset briefly when dialog opens with existing event
**Why it happens:** Formik initialValues change but enableReinitialize causes unnecessary reset
**How to avoid:** Use separate useEffect to load event data, don't change initialValues after mount
**Warning signs:** UI flickers, budget sections show empty then populate, console warnings about unmounted state updates

```typescript
// BAD:
useEffect(() => {
  if (code) {
    EventClient.get(code).then((res) => {
      formik.setValues(res); // Causes full form reset
    });
  }
}, [code]);

// GOOD:
const [initialValues, setInitialValues] = useState(schema.default());

useEffect(() => {
  if (open && code) {
    EventClient.get(code).then((res) => {
      setInitialValues(res); // Set before Formik mounts
    });
  }
}, [open, code]);
```

### Pitfall 3: Mutating State Objects Directly
**What goes wrong:** Component doesn't re-render when participant allocations change
**Why it happens:** React compares state by reference; mutating objects in place doesn't trigger re-render
**How to avoid:** Always create new objects/arrays with spread operator or map
**Warning signs:** UI doesn't update after changes, forcing full page refresh shows changes

```typescript
// BAD:
const handleAmountChange = (personId: string, amount: number) => {
  const participant = participantStates.find((p) => p.personId === personId);
  participant.moneyAmount = amount; // Mutation!
  setParticipantStates(participantStates); // Same reference - no re-render
};

// GOOD:
const handleAmountChange = (personId: string, amount: number) => {
  setParticipantStates((prev) =>
    prev.map((p) =>
      p.personId === personId
        ? { ...p, moneyAmount: amount, moneyDirty: true } // New object
        : p
    )
  );
};
```

### Pitfall 4: Over-Computing in Render
**What goes wrong:** UI becomes sluggish when typing or changing form values
**Why it happens:** Expensive calculations (like totals, summaries) run on every render
**How to avoid:** Use useMemo for derived values that depend on specific inputs
**Warning signs:** Input lag when typing, slow accordion expand/collapse, poor scroll performance

```typescript
// BAD:
function EventBudgetManagementSection({ participants, formValues }) {
  // Runs on EVERY render
  const totalAllocated = participants.reduce((sum, p) => sum + p.moneyAmount, 0);
  const summary = generateComplexSummary(participants, formValues);

  return <div>{summary}</div>;
}

// GOOD:
function EventBudgetManagementSection({ participants, formValues }) {
  const totalAllocated = useMemo(
    () => participants.reduce((sum, p) => sum + p.moneyAmount, 0),
    [participants]
  );

  const summary = useMemo(
    () => generateComplexSummary(participants, formValues),
    [participants, formValues.defaultTimeAllocationType, formValues.budget]
  );

  return <div>{summary}</div>;
}
```

## Code Examples

Verified patterns from codebase:

### Formik Field Integration with MUI
```typescript
// Source: EventForm.tsx lines 57-72
<Field
  name="description"
  type="text"
  label="Description"
  fullWidth
  component={TextField}
/>

<Field
  name="budget"
  type="number"
  label="Budget"
  fullWidth
  component={TextField}
/>
```

### Lifting Formik State Pattern
```typescript
// Source: EventForm.tsx structure (adapt to EventDialog level)

// Current pattern at EventForm level:
export function EventForm({value, onSubmit}: EventFormProps) {
  const init = {...schema.default(), ...mutatePeriod(value)};
  return (
    value && (
      <Formik
        enableReinitialize
        initialValues={init}
        onSubmit={onSubmit}
        validationSchema={schema}
      >
        {({values, setFieldValue}) => (
          <EventFormFields values={values} setFieldValue={setFieldValue}/>
        )}
      </Formik>
    )
  );
}

// Adapt to lift to EventDialog level:
export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [state, setState] = useState<EventFormValues | undefined>(undefined);

  const handleSubmit = (values: EventFormValues) => {
    // Save event + budgets together
  };

  return (
    <Dialog>
      {state && (
        <Formik
          enableReinitialize
          initialValues={state}
          onSubmit={handleSubmit}
          validationSchema={schema}
        >
          {(formik) => (
            <>
              <EventFormFields formik={formik} />
              {code && (
                <EventBudgetManagementSection formValues={formik.values} />
              )}
            </>
          )}
        </Formik>
      )}
    </Dialog>
  );
}
```

### MUI Accordion Collapsed by Default
```typescript
// Source: EventBudgetManagementDialog.tsx structure (change default state)

// Current (expanded by default):
const [timeExpanded, setTimeExpanded] = useState(false);

<Accordion
  expanded={timeExpanded}
  onChange={(_, isExpanded) => setTimeExpanded(isExpanded)}
>
  <AccordionSummary
    expandIcon={<ExpandMore/>}
    sx={{
      bgcolor: 'action.hover',
      '&:hover': {bgcolor: 'action.selected'},
    }}
  >
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%'}}>
      <Typography variant="subtitle1" fontWeight="medium">
        Time Budget Allocations
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {getTimeSummary()} {/* Summary shown when collapsed */}
      </Typography>
    </Box>
  </AccordionSummary>

  <AccordionDetails sx={{p: 3}}>
    <EventTimeAllocationSection /> {/* Details shown when expanded */}
  </AccordionDetails>
</Accordion>
```

### Reusable EventBudgetSummaryBanner
```typescript
// Source: EventBudgetSummaryBanner.tsx (already exists, reuse for collapsed view)

<EventBudgetSummaryBanner
  totalBudget={formValues.budget}
  totalAllocated={totalMoneyAllocated}
  totalTime={totalTimeAllocated}
  currency="€"
/>
```

### ConfirmDialog for Unsaved Changes
```typescript
// Source: EventDialog.tsx lines 142-148 (adapt for budget changes)

<ConfirmDialog
  open={showCloseWarning}
  onClose={() => setShowCloseWarning(false)}
  onConfirm={() => {
    setBudgetsDirty(false);
    onComplete();
  }}
>
  <Typography>
    You have unsaved budget changes. Close anyway?
  </Typography>
</ConfirmDialog>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multiple save buttons per section | Single dialog-level save | Phase 2 (this phase) | Simpler UX, clearer save boundaries |
| Budget sections read from mock data | Budget sections derive from form values | Phase 2 (this phase) | Single source of truth, live updates |
| Always-expanded accordions | Progressive disclosure (collapsed by default) | Phase 2 (this phase) | Less overwhelming, faster overview |
| Separate EventForm Formik instance | Lifted Formik to EventDialog | Phase 2 (this phase) | Enables cross-section reactivity |

**Deprecated/outdated:**
- mockEvents data source: Phase 2 eliminates dependency on BudgetAllocationMocks, use form values directly
- Individual save buttons in EventTimeAllocationSection/EventMoneyAllocationSection: Remove handleSave, use dialog-level save

## Open Questions

1. **Should we preserve participant budget state when switching between event codes in the same dialog session?**
   - What we know: EventDialog opens with a specific code, dialog closes on save/cancel
   - What's unclear: Whether dialog ever changes code without closing (unlikely based on current usage)
   - Recommendation: Assume dialog always closes between events - simpler state management

2. **How should we handle per-day breakdown expansion state when accordion collapses?**
   - What we know: EventBudgetParticipantRow has internal expand state for per-day breakdown
   - What's unclear: Should collapsing the accordion reset all participant row expansions?
   - Recommendation: Keep participant row expansion state independent (user preference preserved)

3. **Should budget validation errors block event save?**
   - What we know: Time allocations can exceed budget, money allocations can over-allocate
   - What's unclear: Whether these are warnings or hard errors
   - Recommendation: Allow save with warnings (show alerts but don't block) - admin knows best

## Sources

### Primary (HIGH confidence)
- /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application/src/main/react/features/event/EventForm.tsx - Formik pattern, form fields
- /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application/src/main/react/features/event/EventDialog.tsx - Dialog structure, state management
- /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx - Accordion pattern, budget sections
- /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx - Summary component
- /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-core/src/main/react/components/ConfirmDialog.tsx - Unsaved changes dialog
- /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/package.json - Tech stack versions
- /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/CLAUDE.md - Project conventions

### Secondary (MEDIUM confidence)
- React documentation: State lifting pattern (https://react.dev/learn/sharing-state-between-components)
- Formik documentation: enableReinitialize prop (https://formik.org/docs/api/formik#enablereinitialize-boolean)
- MUI documentation: Accordion API (https://mui.com/material-ui/react-accordion/)

### Tertiary (LOW confidence)
None - all findings verified from codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries and versions verified from package.json and existing usage
- Architecture: HIGH - Patterns extracted from 20+ similar forms/dialogs in codebase
- Pitfalls: HIGH - Common React/Formik issues well-documented, examples from actual codebase patterns

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (30 days - stable stack, React/MUI patterns unlikely to change)
