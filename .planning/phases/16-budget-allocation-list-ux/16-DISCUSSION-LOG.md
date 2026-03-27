# Phase 16: Budget Allocation List UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 16-Budget Allocation List UX
**Areas discussed:** Event link navigation

---

## Event Link Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Add URL deep linking (Recommended) | Add ?code=XYZ support to EventFeature so clicking an event allocation navigates to /event?code=XYZ and auto-opens that event's dialog | |
| Navigate to event list only | Keep the link as /event — admin lands on the event list and finds the event manually | |
| Skip Phase 16 entirely | All three requirements appear functionally done already | |
| Other (user's choice) | Add the query param to the link now, but don't implement the receiving side yet | ✓ |

**User's choice:** Add `?code=XYZ` to the link URL, but EventFeature consuming the param is deferred to GitHub #458.
**Notes:** User confirmed GitHub issue #458 already tracks deep linking across pages. This phase just wires the outgoing link; the receiving side is separate work.

---

## Codebase Analysis Notes

- LIST-01 (event names): Already fully implemented
- LIST-03 (filter chips): Already fully implemented
- Only LIST-02 needed discussion — the admin link target URL

## Claude's Discretion

None — all decisions locked by user or already implemented.

## Deferred Ideas

- EventFeature deep link consumption — GitHub #458
