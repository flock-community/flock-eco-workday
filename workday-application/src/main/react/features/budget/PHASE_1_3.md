# Phase 1.3: Event Budget Allocation Dialog

## Overview

Phase 1.3 implements the Event Budget Allocation Dialog, which allows users (with admin permissions) to create budget allocations tied to specific events. This dialog handles both time allocations (Study Time / Hack Time) and money allocations (Study Money).

## Component Created

### `EventBudgetAllocationDialog.tsx`

A comprehensive dialog for creating event-based budget allocations with the following features:

## Key Features

### 1. Event Selection
- **Autocomplete** dropdown with all available events
- Shows event name, code, and date range
- Uses mock event data from `BudgetAllocationMocks.ts`

### 2. Allocation Type Selection
- Choose between **Study Budget** or **Hack Budget**
- Default allocation type is pre-set based on event configuration
- Determines which budget types are available

### 3. Dynamic Time Allocation
- **Auto-generates** daily time allocations based on event date range
- Each day defaults to 8 hours
- Users can:
  - Add additional days
  - Remove days (minimum 1 required)
  - Adjust hours per day (supports decimals like 4.5h)
  - Change dates for each allocation
- Shows total hours across all days
- **Over-budget warning** if total exceeds available hours

### 4. Optional Money Allocation (Study Only)
- Only available when Study Budget is selected
- Can be added/removed via toggle
- Fields:
  - Amount (€)
  - File upload for receipts/invoices
- **Over-budget warning** if amount exceeds available money

### 5. Combined Allocations
- Can create **both** time and money allocations in a single submission
- Each allocation type is saved separately
- All linked to the same event

### 6. Budget Validation
- Real-time validation against available budgets
- Displays current available amounts for:
  - Study Hours
  - Hack Hours
  - Study Money
- **Soft warnings** - over-budget allocations can still be submitted (for approval)

## User Flow

### Step 1: Select Event
1. Click "Add Allocation" button
2. Choose "Event Allocation" from menu
3. Dialog opens
4. Select event from autocomplete dropdown

### Step 2: Configure Allocation Type
1. Choose Study or Hack budget
2. Daily time allocations are auto-generated based on event dates
3. Adjust hours and dates as needed

### Step 3: Add Time Allocation (Optional)
- Toggle time allocation on/off
- Modify daily hours
- Add or remove days
- View total hours

### Step 4: Add Money Allocation (Optional, Study only)
- Toggle money allocation on/off
- Enter amount
- Upload receipts/invoices
- View over-budget warnings if applicable

### Step 5: Submit
- Click "Create" to save all allocations
- Both time and money allocations are created
- Dialog closes
- Allocations logged to console (mock implementation)

## Integration Points

### BudgetAllocationList.tsx
Updated to include:
- Menu for choosing allocation type (Event vs Free-form)
- Event Budget Allocation Dialog integration
- Handler for saving event allocations

### BudgetAllocationFeature.tsx
Updated to include:
- `handleCreateEventAllocations` handler
- Pass required budget availability props to list

## Props Interface

```typescript
interface EventBudgetAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (allocations: EventAllocationFormData[]) => void;
  personId: string;
  personName: string;
  availableStudyHours: number;
  availableHackHours: number;
  availableStudyMoney: number;
}
```

## Data Structure

### EventAllocationFormData
```typescript
{
  type: 'StudyTime' | 'HackTime' | 'StudyMoney' | 'FlockMoney';
  eventCode: string;
  eventName: string;
  date: string;
  description: string;
  // For time allocations
  dailyTimeAllocations?: DailyTimeAllocation[];
  totalHours?: number;
  // For money allocations
  amount?: number;
  files?: File[];
}
```

## Validation Rules

### Required Fields
- Event selection (required)
- At least one allocation type (time or money)

### Time Allocation
- Must have at least 1 day if time allocation is included
- Hours must be > 0
- Dates must be valid

### Money Allocation
- Amount must be > 0 if money allocation is included
- Files are optional

### Budget Checks
- Warns if exceeds available budget
- Does NOT block submission (soft validation)

## UX Highlights

### ✅ Smart Defaults
- Auto-generates time allocations from event dates
- Pre-selects allocation type based on event configuration
- Defaults to 8 hours per day

### ✅ Flexible Configuration
- Toggle time/money allocations independently
- Combine multiple allocation types in one submission
- Adjust hours per day with decimal precision

### ✅ Clear Feedback
- Budget availability shown at top
- Over-budget warnings with specific amounts
- Total hours calculated in real-time
- Button color changes when over budget (warning color)

### ✅ File Management
- Multiple file upload support
- Preview uploaded files as chips
- Remove files individually
- Accepts PDF, JPG, PNG formats

## Mock Data Usage

The dialog uses mock events from `BudgetAllocationMocks.ts`:
- `mockEvents` - Array of available events
- Each event includes:
  - code, name, description
  - from/to dates
  - defaultTimeAllocationType (STUDY or HACK)
  - Optional totalBudget
  - Optional existing budgetAllocations

## Console Logs

When creating allocations, the dialog logs:
```javascript
console.log('Creating Event Budget Allocations:', [
  {
    type: 'StudyTime',
    eventCode: 'REACT_CONF_2026',
    eventName: 'React Conference 2026',
    date: '2026-01-15',
    description: 'Conference attendance',
    dailyTimeAllocations: [
      { date: '2026-01-15', hours: 8 },
      { date: '2026-01-16', hours: 8 }
    ],
    totalHours: 16
  },
  {
    type: 'StudyMoney',
    eventCode: 'REACT_CONF_2026',
    eventName: 'React Conference 2026',
    date: '2026-01-15',
    description: 'Conference attendance',
    amount: 800,
    files: [File, File]
  }
]);
```

## Testing Scenarios

### 1. Study Event with Time and Money
- Select a study event
- Keep default time allocation (auto-generated)
- Add study money allocation
- Upload receipt
- Submit → Creates 2 allocations

### 2. Hack Event with Time Only
- Select a hack event
- Allocation type switches to "Hack Budget"
- Adjust hours for each day
- Add extra day
- Submit → Creates 1 time allocation

### 3. Over Budget Warning
- Select event
- Enter time exceeding available hours
- See warning
- Can still submit (soft validation)

### 4. Custom Time Allocation
- Select event
- Remove auto-generated days
- Add custom dates
- Set different hours per day
- View total updating in real-time

## Material-UI Components Used

- Dialog, DialogTitle, DialogContent, DialogActions
- Autocomplete (for event selection)
- Select, MenuItem, FormControl, InputLabel
- TextField (text, number, date types)
- Button, IconButton
- Stack, Box
- Alert
- Chip
- Typography
- Divider

## Future Enhancements (Backend Integration)

When backend is ready:
1. Replace mock events with API call
2. Save allocations to database
3. Return created allocation IDs
4. Refresh allocation list after creation
5. Handle file upload to document service
6. Real-time budget validation from server
7. Approval workflow integration

## Files Modified

1. **Created**: `EventBudgetAllocationDialog.tsx`
2. **Updated**: `BudgetAllocationList.tsx` - Added menu and dialog integration
3. **Updated**: `BudgetAllocationFeature.tsx` - Added event allocation handler
4. **Updated**: `index.ts` - Export new component
5. **Updated**: `README.md` - Document Phase 1.3 completion

## Summary

Phase 1.3 successfully implements a comprehensive event budget allocation dialog that:
- ✅ Handles both time and money allocations
- ✅ Works for both Study and Hack budgets
- ✅ Provides smart defaults and flexible configuration
- ✅ Includes budget validation with soft warnings
- ✅ Supports file uploads for receipts
- ✅ Integrates seamlessly with existing components
- ✅ Uses mock data for UX prototyping
- ✅ Ready for backend integration

The dialog provides a complete UX for creating event-based budget allocations without requiring any backend implementation, making it perfect for Phase 1 prototyping and validation.
