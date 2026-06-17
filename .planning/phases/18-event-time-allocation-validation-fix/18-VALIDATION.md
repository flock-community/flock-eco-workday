# Phase 18 — Validation Strategy

## Manual repro checklist

1. Start backend (`docker compose up -d backend`) and frontend (`npm start`).
2. Create event: 2 days, hours `[8, 4]`, allocation type `StudyTime`, 2+ participants. Save.
3. Reopen from event list → expand Time Budget Allocations.
4. **Assert:** No validation errors for the auto-created allocations.
5. Click "Customize" on one participant.
6. **Assert:** Period inputs seeded `[8h, 4h]` (not `[6h, 6h]`).
7. Change day 1 to `9h` → **Assert:** error "9h exceeds event hours (8h)".
8. Repeat steps 2–4 with `HackTime` — same result.
9. Create a `StudyMoney` event — **Assert:** no regression in money panel.

## Unit tests (Jest)

Location: add to existing event component tests.

- `EventTimeAllocationSection` with `eventDayHours=[8,4]`, participant `studyPeriod.days=[8,4]` → 0 errors.
- Same with `studyPeriod.days=[9,4]` → 1 error containing "9h" and "8h".
- `handleAddCustomAllocation` with `eventDayHours=[8,4]` → `studyPeriod.days=[8,4]`.

## TypeScript

- `yolo` passes clean. ✅
