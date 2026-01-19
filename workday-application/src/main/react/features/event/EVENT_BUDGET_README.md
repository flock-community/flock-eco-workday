# Event Budget Management Components

This directory contains components for event-centric budget allocation management.

## Overview

The event budget management feature allows administrators to manage budget allocations for all participants of an event from a single interface. This is distinct from the person-centric budget view where individuals manage their own allocations.

## Components

### EventBudgetManagementSection

Main expandable accordion section that orchestrates event-centric budget allocation.

**Exported from:** `EventBudgetManagementDialog.tsx`

**Props:**
- `event: FullFlockEvent | null` - Event data
- `expanded?: boolean` - Accordion expanded state
- `onChange?: (expanded: boolean) => void` - Expansion change callback

**Features:**
- Expandable accordion section (Material-UI Accordion)
- Manages all participant allocations
- Flock company allocation
- Live budget validation
- Mock data integration
- Save button at bottom of section

### EventBudgetSummaryBanner.tsx

Live budget validation banner showing total vs allocated amounts.

**Props:**
- `totalBudget?: number` - Event total budget (optional)
- `totalAllocated: number` - Sum of all allocations
- `totalTime?: number` - Sum of time allocations (optional)
- `currency?: string` - Currency symbol (default: '€')

**Features:**
- Real-time validation
- Color-coded status (warning/success/info)
- Shows remaining budget or overage

### EventBudgetParticipantList.tsx

List of all participants with quick actions.

**Props:**
- `participants: ParticipantAllocation[]` - Array of participant allocations
- `onParticipantChange: (index, allocation) => void` - Update callback
- `defaultAllocationType: BudgetAllocationType` - Event default
- `eventDuration: number` - Event duration in hours
- `totalBudget?: number` - Event total budget (optional)
- Budget limits per person (study hours, hack hours, study money)

**Quick Actions:**
- Divide Time Equally - Distributes event duration to all participants
- Divide Money Equally - Distributes budget evenly

### EventBudgetParticipantRow.tsx

Per-person allocation management with time and money inputs.

**Props:**
- `allocation: ParticipantAllocation` - Participant allocation data
- `onChange: (allocation) => void` - Update callback
- Budget limits (availableStudyHours, availableHackHours, availableStudyMoney)
- `defaultAllocationType: BudgetAllocationType` - Default allocation type
- `showDailyBreakdown?: boolean` - Initial daily breakdown state

**Features:**
- Time allocation with Study/Hack toggle
- Daily time breakdown (collapsible)
- Money allocation with file upload
- Add/Remove allocation sections
- Live budget warnings

### EventBudgetFlockSection.tsx

Flock company allocation (money not assigned to individuals).

**Props:**
- `flockAmount: number` - Current Flock allocation
- `onFlockAmountChange: (amount) => void` - Update callback
- `description: string` - Allocation description
- `onDescriptionChange: (desc) => void` - Description update callback
- `totalBudget?: number` - Event total budget (optional)
- `totalParticipantAllocation: number` - Sum of participant money

**Features:**
- Amount input
- Description field
- "Assign Remaining" button

### EventBudgetSummaryBanner.tsx

Live budget validation banner.

**Props:**
- `totalBudget?: number` - Event total budget
- `totalAllocated: number` - Total allocated amount
- `totalTime?: number` - Total time allocated
- `currency?: string` - Currency symbol

**Features:**
- Real-time budget summary
- Color-coded status indicators
- Shows remaining budget or overage

## Integration

The event budget management section is integrated into the Events feature via the `EventDialog` component as an **expandable accordion**:

```typescript
// In EventDialog.tsx
{code && eventData && (
  <Grid size={{ xs: 12 }}>
    <EventBudgetManagementSection
      event={eventData}
      expanded={budgetExpanded}
      onChange={setBudgetExpanded}
    />
  </Grid>
)}
```

The accordion section only appears for existing events (not during creation). It expands inline within the dialog rather than opening as a separate overlay.

## Data Flow

1. User opens event from Events page
2. EventDialog shows expandable "Budget Allocations" accordion section
3. User clicks to expand the accordion
4. Section loads existing allocations from mock data
5. User modifies allocations (state updates locally)
6. Live validation updates in real-time
7. On save, logs payload to console (Phase 1 - no backend)

## Types

### ParticipantAllocation

```typescript
interface ParticipantAllocation {
  personId: string;
  personName: string;
  // Time allocation
  allocationType?: BudgetAllocationType; // 'STUDY' | 'HACK'
  totalHours?: number;
  dailyTimeAllocations?: DailyTimeAllocation[];
  // Money allocation
  amount?: number;
  files?: File[];
  description?: string;
}
```

### DailyTimeAllocation

```typescript
interface DailyTimeAllocation {
  date: string; // ISO date string
  hours: number;
}
```

## Mock Data

Uses mock data from `../budget/mocks/BudgetAllocationMocks.ts`:
- `mockEvents` - Event list with default allocation types
- `mockEventWithBudgetAllocations` - Example event with allocations
- Budget data per person

## Phase 1 Constraints

**All mutations are mocked** - Changes are logged to console only:

```javascript
console.log('Saving Event Budget Allocations:', {
  eventCode: 'REACT_CONF_2026',
  allocations: [...]
});
```

## Related Documentation

- `PHASE_1_3B_SUMMARY.md` - Implementation summary for Phase 1.3b
- `PLAN.md` - Overall implementation plan
- `../budget/PHASE_1_3_REVISED.md` - Explains person-centric vs event-centric views
