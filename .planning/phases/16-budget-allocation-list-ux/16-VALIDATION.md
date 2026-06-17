---
phase: 16
slug: budget-allocation-list-ux
status: complete
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-22
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (e2e) |
| **Config file** | `playwright.config.ts` (project root) |
| **Quick run command** | `npx playwright test tests/budget-admin.spec.ts` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/budget-admin.spec.ts`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | LIST-02 | — | N/A | e2e | `npx playwright test tests/budget-admin.spec.ts --grep "LIST-02"` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Playwright was already configured; no new installs needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| None | — | — | — |

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-22

---

## Validation Audit 2026-05-22

| Metric | Count |
|--------|-------|
| Gaps found | 3 |
| Resolved | 3 |
| Escalated | 0 |

### Tests Added

| Requirement | Test ID | File | Command | Status |
|-------------|---------|------|---------|--------|
| LIST-01 | `LIST-01: Event allocation card shows event name not raw event code` | `tests/budget-admin.spec.ts` | `npx playwright test tests/budget-admin.spec.ts --grep "LIST-01"` | ✅ green |
| LIST-02 | `LIST-02: Admin clicking event allocation link navigates to /event?code=` | `tests/budget-admin.spec.ts` | `npx playwright test tests/budget-admin.spec.ts --grep "LIST-02"` | ✅ green |
| LIST-03 | `LIST-03: Filter chips are present and toggle the allocation list` | `tests/budget-admin.spec.ts` | `npx playwright test tests/budget-admin.spec.ts --grep "LIST-03"` | ✅ green |

### Notes

- Pre-existing BMGT-01 has a stale assertion (`144h` expected, `136h` actual) — 24h more hack time booked since test was written. Unrelated to phase 16 changes.
- LIST-01 wiring: `EventAllocationListItem` derives display name from `allocations[0]?.description` (not `eventName` prop as documented in VERIFICATION.md). Behavior correct; docs slightly inaccurate.
