---
phase: 16-budget-allocation-list-ux
plan: 01
status: complete
started: 2026-03-27
completed: 2026-03-27
---

## Summary

Fixed admin event link href in `EventAllocationListItem.tsx` from `/event` to `/event?code=${eventCode}`, enabling future deep-link navigation (GitHub #458).

## Self-Check: PASSED

All acceptance criteria verified:
- Line 148 contains `href={`/event?code=${eventCode}`}`
- Old bare `href="/event"` removed (grep count = 0)
- TypeScript compiles without errors
- Employee branch unchanged (plain text, no Link)

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Fix admin event link href to include ?code= query param | ✓ Complete |

## Key Files

### Modified
- `workday-application/src/main/react/features/budget/EventAllocationListItem.tsx` — line 148 href updated

## Deviations

None — single-line change as planned.

## Commits

- `66b6de4f` — feat(budget): add event code query param to admin allocation link (LIST-02)
