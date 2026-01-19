# Budget Allocation Feature - Phase 1.2

## Overview

This directory contains the Budget Allocation Tab UX prototype implementation (Phase 1.2 from PLAN.md).

All components use **mocked data** and mutations only log to the console. No backend integration yet.

## Components Created

### Main Feature
- **`BudgetAllocationFeature.tsx`** - Main feature component with year/person selectors

### Budget Summary
- **`BudgetSummaryCards.tsx`** - Grid of three budget cards
- **`BudgetCard.tsx`** - Reusable budget card with progress visualization

### Allocation Lists
- **`BudgetAllocationList.tsx`** - Tabbed interface (Events | Study Money)
- **`EventAllocationListItem.tsx`** - Card showing event-based allocations
- **`StudyMoneyAllocationListItem.tsx`** - Free-form study money allocations

### Dialogs
- **`StudyMoneyAllocationDialog.tsx`** - Create/edit free-form study money allocations
- **`EventBudgetAllocationDialog.tsx`** - For use in Events feature (not used in Budget view)

### Mock Data
- **`mocks/BudgetAllocationMocks.ts`** - Complete mock data layer with types and utilities

### Demo
- **`BudgetAllocationDemo.tsx`** - Demo page for testing user and admin modes

## Key Features Implemented

### ✅ User Mode (Read-Only)
- View own budget summary (Hack Hours, Study Hours, Study Money)
- See budget usage with visual progress bars
- View all allocations in a unified list (event-based and free-form)
- Event allocations marked with event icon
- Free-form allocations marked with document icon
- Year selector
- **No** create/edit/delete actions (read-only)

### ✅ Admin Mode (Full Access)
- All user mode features
- Person selector to view any person's budget
- Switch between different persons
- **Create** new free-form study money allocations
- **Edit** pending study money allocations
- **Delete** pending study money allocations
- **Note:** Event allocations are managed from Events feature

### ✅ Validation & UX
- Over-budget warnings (soft warnings, doesn't block)
- Real-time budget validation
- Status indicators (Approved, Requested, Rejected)
- File upload UI (placeholder - logs to console)
- Form validation (required fields)
- Loading states
- Empty states

## Testing the Feature

### Option 1: Using the Demo Page

Add a route to the demo page in your router configuration:

```tsx
import { BudgetAllocationDemo } from './features/budget/BudgetAllocationDemo';

// Add to routes:
<Route path="/budget-demo" element={<BudgetAllocationDemo />} />
```

Then navigate to `/budget-demo` in your browser.

### Option 2: Direct Component Usage

```tsx
import { BudgetAllocationFeature } from './features/budget';

// User view
<BudgetAllocationFeature
  isAdmin={false}
  currentPersonId="550e8400-e29b-41d4-a716-446655440000"
/>

// Admin view
<BudgetAllocationFeature
  isAdmin={true}
  currentPersonId="550e8400-e29b-41d4-a716-446655440000"
/>
```

## Mock Data

The feature uses realistic mock data from `mocks/BudgetAllocationMocks.ts`:

- **3 mock persons** with different budgets
- **Multiple allocation types** (StudyTime, StudyMoney, HackTime, FlockMoney)
- **Event-based allocations** with multiple participants
- **Free-form allocations** without events
- **Different approval statuses** (Requested, Approved, Rejected)
- **Budget scenarios**: Normal, over-budget, and empty

## What Logs to Console

All mutations and navigation log detailed information:

```javascript
// Create Study Money Allocation (free-form)
console.log('Creating StudyMoneyBudgetAllocation:', { ... });

// Update Study Money Allocation
console.log('Updating StudyMoneyBudgetAllocation:', { ... });

// Delete Study Money Allocation
console.log('Deleting StudyMoneyBudgetAllocation:', id);

// File upload
console.log('Files selected:', ['file1.pdf', 'file2.jpg']);

// Year/Person changes
console.log('Loading budget details for:', { personId, year });

// Navigate to event (from event allocation)
console.log('Navigate to event:', eventCode);
```

**Note:** Event budget allocations (creation/editing) will be logged from the Events feature, not from Budget view.

## Key UX Validations

### ✅ Budget Cards
- [x] Show budget, used, and available amounts
- [x] Visual progress bar with percentage
- [x] Different colors for different budget types
- [x] Over-budget warning (red text and error color)

### ✅ Unified List Display
- [x] Single list showing all allocations (event-based and free-form)
- [x] Sorted by date (most recent first)
- [x] Event allocations marked with event icon
- [x] Free-form allocations marked with document icon
- [x] Event allocations grouped by event code
- [x] Empty states when no data
- [x] Total count displayed in header

### ✅ Study Money Dialog (Admin Only)
- [x] Opens/closes correctly
- [x] Shows available budget
- [x] Real-time over-budget warning
- [x] Form validation (required fields)
- [x] File upload UI (placeholder)
- [x] Edit mode pre-fills data
- [x] Create mode starts empty

### ✅ Event Allocation Display & Navigation
- [x] Event allocations shown with event icon
- [x] Clickable event names to navigate to Events page
- [x] "Open in New" icon button for navigation
- [x] Tooltip guidance for event management
- [x] Info alert explaining event allocations are managed from Events feature
- [x] Read-only display of all event-based allocations
- [x] Grouped by event code

### ✅ Year Selector
- [x] Shows current year and previous 2 years
- [x] Changes displayed data when selected
- [x] Simulates API delay

### ✅ Person Selector (Admin)
- [x] Only visible in admin mode
- [x] Shows all mock persons
- [x] Changes displayed data when selected
- [x] Updates budget summary

### ✅ Permissions-Based UI
- [x] User mode: Read-only view, no action buttons
- [x] Admin mode: Full access with Add/Edit/Delete buttons
- [x] "Add Allocation" button only visible to admins
- [x] Edit/Delete icons only visible to admins
- [x] Cannot delete approved allocations (even for admins)

## Phase 1.3 Completed ✅ (Revised)

**Original approach:** Event Budget Allocation Dialog in Budget view (removed)

**Revised approach:**
- Event allocations are **read-only** in Budget view
- Navigation links added to Events page
- Info alerts guide users to Events feature
- Only free-form study money allocations can be created from Budget view

**Rationale:** Event allocations should be managed from an event-centric view (Events feature), where you can manage all participants and company budget for an event in bulk.

See `PHASE_1_3_REVISED.md` for detailed explanation.

## Next Steps (Phase 1.4+)

- Implement event-centric allocation management in Events feature
- Backend integration for Budget Allocation view
- Continue with remaining phases as outlined in PLAN.md

## Component Dependencies

```
BudgetAllocationFeature
├── BudgetSummaryCards
│   └── BudgetCard (×3)
└── BudgetAllocationList
    ├── Info Alert (if events present)
    ├── Add Study Money Button (admin only)
    ├── EventAllocationListItem (read-only, with navigation)
    ├── StudyMoneyAllocationListItem (editable)
    └── StudyMoneyAllocationDialog
```

Note: `EventBudgetAllocationDialog` exists but is reserved for Events feature, not used in Budget view.

## TypeScript Types

All types are defined in `mocks/BudgetAllocationMocks.ts`:

- `BudgetAllocationType` - STUDY | HACK
- `ApprovalStatus` - REQUESTED | APPROVED | REJECTED
- `BudgetAllocation` - Union type of all allocation types
- `BudgetSummary` - Summary with all three budget types
- `BudgetAllocationDetails` - Complete person budget view

## Material-UI Components Used

- Card, CardContent
- Grid, Stack, Box
- Typography
- Button, IconButton
- TextField
- Dialog, DialogTitle, DialogContent, DialogActions
- Tabs, Tab
- Chip
- Alert
- LinearProgress
- Select, MenuItem, FormControl, InputLabel
- ToggleButtonGroup, ToggleButton

## Browser Console Notes

Open browser DevTools console to see all mutation logs when:
- Creating a study money allocation
- Editing a study money allocation
- Deleting a study money allocation
- Uploading files
- Changing year or person
