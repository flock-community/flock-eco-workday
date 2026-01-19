# Budget Allocation Redesign - Money vs Time Separation

**Date:** 2026-01-19
**Status:** ✅ Complete

## Overview

The budget allocation feature has been redesigned to **completely separate money and time allocations** with distinct behaviors and UX patterns.

## Key Principles

### Money Allocation
**Must sum to total event budget (costs)**

- All participant allocations + Flock allocation = Event total budget
- By default, participants get equal share
- Editable per participant
- Flock can receive remainder
- Clear remaining budget indicator
- Warnings when over-allocated

### Time Allocation
**Individual allocations that don't sum**

- Each participant gets their own time allocation
- Default: Event duration with event's default budget type
- Participants can customize per day (hours, budget type)
- **Exception-based display:** Only show participants who deviate from defaults
- Participants using defaults are hidden by default (toggle to show all)

## Components Created

### 1. EventMoneyAllocationSection.tsx

Manages money distribution across participants and Flock.

**Features:**
- Live budget summary (total/allocated/remaining)
- Three quick actions:
  - **Distribute Equally** - Divide total evenly among all participants
  - **Distribute Remainder** - Subtract Flock first, divide rest among participants
  - **Clear All** - Reset all allocations to zero
- Flock allocation input (highlighted section)
- Per-participant amount inputs
- Color-coded warnings when over-allocated

**Data Structure:**
```typescript
interface PersonMoneyAllocation {
  personId: string;
  personName: string;
  amount: number;
}
```

### 2. EventTimeAllocationSection.tsx

Manages individual time allocations with exception-based display.

**Features:**
- Shows event defaults prominently (hours/day, budget type)
- Counts participants using defaults vs custom allocations
- **Exception-only display by default**
- "Show all participants" toggle
- Per-participant daily overrides:
  - Date selection
  - Hours input (null = not attending)
  - Budget type override (STUDY/HACK/None)
- Visual distinction for participants with custom allocations (blue border)
- Collapsible daily breakdown per participant

**Data Structure:**
```typescript
interface DailyTimeOverride {
  date: string;
  hours: number | null; // null = not attending
  budgetType: BudgetAllocationType | null; // null/STUDY/HACK
}

interface PersonTimeAllocation {
  personId: string;
  personName: string;
  dailyOverrides: DailyTimeOverride[]; // Only exceptional days
}
```

## UX Decisions

### Money Allocation UX

1. **Sum Constraint Enforcement**
   - Live feedback shows remaining budget
   - Warning (not blocking) when over-allocated
   - Color-coded chips: success (fully allocated), warning (over), info (under)

2. **Quick Actions**
   - Reduce manual calculation
   - Common operations are one-click
   - "Distribute Remainder" respects Flock allocation

3. **Flock Prominence**
   - Separate highlighted section
   - Appears before participant list
   - Visually distinct background color

### Time Allocation UX

1. **Exception-Based Display**
   - **Default: Hide participants using event defaults**
   - Only show participants with custom allocations
   - Clear count of hidden vs shown participants
   - Easy toggle to "Show all" if needed

2. **Instinctive Clarity**
   - Event defaults shown at top (hours/day, type, duration)
   - Blue border highlights participants with exceptions
   - Chip shows "Using defaults" for those without exceptions
   - Total hours calculated and displayed per participant

3. **Per-Day Customization**
   - Can override hours per day
   - Can override budget type per day
   - Can mark as not attending (null hours)
   - Daily overrides collapsible per participant

4. **Progressive Disclosure**
   - Start with clean view (exceptions only)
   - Expand to see daily breakdown if needed
   - "Customize" button to add first override
   - "Add Day" to add more overrides

## Integration

The EventBudgetManagementSection now uses both new sections:

```typescript
<EventMoneyAllocationSection
  totalBudget={event.costs}
  participants={moneyParticipants}
  flockAmount={flockAmount}
  onParticipantsChange={setMoneyParticipants}
  onFlockAmountChange={setFlockAmount}
/>

<EventTimeAllocationSection
  eventDates={eventDates}
  defaultHoursPerDay={defaultHoursPerDay}
  defaultBudgetType={defaultBudgetType}
  participants={timeParticipants}
  onParticipantsChange={setTimeParticipants}
/>
```

## State Management

Completely separate state for money and time:

```typescript
// Money state
const [moneyParticipants, setMoneyParticipants] = useState<PersonMoneyAllocation[]>([]);
const [flockAmount, setFlockAmount] = useState<number>(0);

// Time state
const [timeParticipants, setTimeParticipants] = useState<PersonTimeAllocation[]>([]);
```

## Initialization

### Money Initialization
- Default: Equal share among all participants
- Loads existing allocations from mock data if present

### Time Initialization
- Default: Empty dailyOverrides array (= using defaults)
- Only loads daily overrides if custom allocations exist

## Save Behavior

Separate logging for money and time:

```javascript
console.log('Saving Event Budget Allocations:', {
  eventCode: 'REACT_CONF_2026',
  totalBudget: 3000,
  moneyAllocations: {
    participants: [
      { personId: '...', personName: 'Alice', amount: 800 },
      { personId: '...', personName: 'Bob', amount: 750 }
    ],
    flock: 200,
    total: 1750
  },
  timeAllocations: {
    participants: [
      {
        personId: '...',
        personName: 'Alice',
        dailyOverrides: [] // Using defaults
      },
      {
        personId: '...',
        personName: 'Bob',
        dailyOverrides: [
          { date: '2026-01-15', hours: 4, budgetType: 'STUDY' },
          { date: '2026-01-16', hours: null, budgetType: null }
        ]
      }
    ],
    defaultHoursPerDay: 8,
    defaultType: 'STUDY'
  }
});
```

## Files Created

- `EventMoneyAllocationSection.tsx` - Money allocation with sum constraint
- `EventTimeAllocationSection.tsx` - Time allocation with exception display

## Files Modified

- `EventBudgetManagementDialog.tsx` - Main section using both new components

## Files Made Obsolete

The following components are no longer used:
- `EventBudgetParticipantList.tsx` (replaced by separate sections)
- `EventBudgetParticipantRow.tsx` (replaced by separate sections)
- `EventBudgetFlockSection.tsx` (integrated into EventMoneyAllocationSection)
- `EventBudgetSummaryBanner.tsx` (replaced by section-specific summaries)

## Benefits

### 1. Conceptual Clarity
- Money and time are fundamentally different
- Each has its own rules and constraints
- Clear separation makes behavior obvious

### 2. Better UX for Money
- Sum constraint is immediately visible
- Quick actions reduce errors
- Remaining budget always shown

### 3. Better UX for Time
- Default behavior is transparent
- Only show what's exceptional
- Reduces cognitive load
- Easy to see who has custom allocations

### 4. Simpler State Management
- No complex shared state
- Each allocation type is independent
- Easier to reason about

### 5. Easier to Extend
- Can add features to one without affecting the other
- Clear boundaries between concerns

## Testing

All functionality tested with mocked data:
- ✅ Money allocations sum correctly
- ✅ Quick actions work (distribute equally, remainder, clear)
- ✅ Remaining budget calculated correctly
- ✅ Over-allocation warnings display
- ✅ Time defaults shown clearly
- ✅ Exception-based display works
- ✅ Toggle show/hide defaults functional
- ✅ Per-day overrides work
- ✅ Budget type per day selectable
- ✅ Null hours (not attending) works
- ✅ Visual distinction for custom allocations
- ✅ Save logs correct structure

## Next Steps

1. Backend API implementation
2. File upload for money allocations
3. Budget validation against person's yearly budget
4. Historical allocation tracking
