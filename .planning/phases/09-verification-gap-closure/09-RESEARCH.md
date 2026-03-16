# Phase 9: Verification Gap Closure - Research

**Researched:** 2026-03-16
**Domain:** Documentation verification, milestone audit remediation
**Confidence:** HIGH

## Summary

Phase 9 is a documentation-only phase that closes gaps identified by the v1.0 milestone audit. The codebase is functionally complete (23/23 requirements implemented, 5/5 E2E flows working), but formal verification artifacts are missing for 3 phases (04, 05, 07), two requirements have incomplete traceability in documentation (DOM-01, DOM-02 missing from Phase 3 SUMMARY frontmatter), one REQUIREMENTS.md checkbox is stale (DOM-03 still unchecked), and one latent code bug exists (downloadFile URL mismatch).

The work is entirely mechanical: create 3 VERIFICATION.md files following the established format, update 2 documentation files (REQUIREMENTS.md, 03-02-SUMMARY.md frontmatter), and fix 1 line of code in BudgetAllocationClient.ts.

**Primary recommendation:** Treat this as a single plan with 7 discrete tasks: 3 VERIFICATION.md creations, 1 REQUIREMENTS.md checkbox fix, 1 SUMMARY frontmatter fix, 1 code bugfix, and 1 re-audit verification.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOM-01 | System stores BudgetAllocation as sealed hierarchy | Needs adding to Phase 3 SUMMARY frontmatter requirements_completed; already verified in 03-VERIFICATION.md |
| DOM-02 | DailyTimeAllocation tracks per-day hours with type override | Needs adding to Phase 3 SUMMARY frontmatter requirements_completed; already verified in 03-VERIFICATION.md |
| DOM-03 | Liquibase migrations create budget_allocation table hierarchy | Checkbox in REQUIREMENTS.md needs updating from [ ] to [x]; needs Phase 4 VERIFICATION.md |
| DOM-04 | ContractInternal entity extended with studyHours and studyMoney | Needs Phase 4 VERIFICATION.md; indirectly confirmed by Phase 8 verification |
| API-01 | Admin can query allocations by person+year | Needs Phase 5 VERIFICATION.md; listed in 05-02-SUMMARY |
| API-02 | Admin can query allocations by event code | Needs Phase 5 VERIFICATION.md; listed in 05-02-SUMMARY |
| API-03 | Admin can create/update/delete StudyMoney allocations | Needs Phase 5 VERIFICATION.md; listed in 05-02-SUMMARY; file download URL mismatch needs fix |
| API-04 | Admin can create/update HackTime and StudyTime allocations | Needs Phase 5 VERIFICATION.md; listed in 05-02-SUMMARY |
| API-05 | Authority-based access control | Needs Phase 5 VERIFICATION.md; listed in 05-01 and 05-02 SUMMARY |
| CTR-02 | Wirespec contract updated with new ContractInternal fields | Needs Phase 5 VERIFICATION.md; listed in 05-01-SUMMARY |
| EVT-01 | Event dialog shows budget management section | Needs Phase 7 VERIFICATION.md; listed in 07-01-SUMMARY |
| EVT-02 | Admin can assign per-participant time allocations | Needs Phase 7 VERIFICATION.md; listed in 07-01-SUMMARY |
| EVT-03 | Admin can assign per-participant money allocations | Needs Phase 7 VERIFICATION.md; listed in 07-01-SUMMARY |
| EVT-04 | Smart defaults based on event type | Needs Phase 7 VERIFICATION.md; listed in 07-01-SUMMARY |
</phase_requirements>

## Gap Inventory (from Milestone Audit)

### Gap 1: Phase 4 Missing VERIFICATION.md
- **Impact:** DOM-03 and DOM-04 cannot be formally verified
- **Location:** `.planning/phases/04-persistence-contract/` (no `04-VERIFICATION.md`)
- **Plans to verify:** 04-01 (DOM-03: Liquibase + JPA entities), 04-03 (DOM-04: ContractInternal study budget fields)
- **Plan 04-01 truths (5):**
  1. Liquibase migrations run without FK constraint failures on clean database
  2. Database schema includes budget_allocation base table with JOINED inheritance to 3 child tables
  3. Element collection tables exist for daily_time_allocations and files
  4. JPA entities compile and map to domain types
  5. Schema test validates JOINED inheritance tables and element collection tables exist
- **Plan 04-03 truths (5):**
  1. ContractInternal entity has studyHours (Int) and studyMoney (BigDecimal) fields
  2. Existing contracts default to 0 for studyHours and 0.00 for studyMoney
  3. ContractInternalForm includes studyHours and studyMoney for API input
  4. Liquibase migration adds columns without breaking existing data
  5. Integration test verifies studyHours and studyMoney persist with correct types
- **Key artifacts to verify:** `db.changelog-027-budget-allocations.yaml`, `BudgetAllocationEntity.kt`, `HackTimeBudgetAllocationEntity.kt`, `StudyTimeBudgetAllocationEntity.kt`, `StudyMoneyBudgetAllocationEntity.kt`, `DailyTimeAllocationEmbeddable.kt`, `BudgetAllocationSchemaTest.kt`, `db.changelog-028-contract-internal-study-budget.yaml`, `ContractInternal.kt`, `ContractInternalForm.kt`, `ContractInternalPersistenceTest.kt`
- **Confidence:** HIGH - all code exists and builds clean per STATE.md

### Gap 2: Phase 5 Missing VERIFICATION.md
- **Impact:** API-01 through API-05 and CTR-02 cannot be formally verified
- **Location:** `.planning/phases/05-api-layer/` (no `05-VERIFICATION.md`)
- **Plans to verify:** 05-01 (CTR-02, API-05: wirespec + config), 05-02 (API-01 through API-05: controller + mapper + tests)
- **Plan 05-01 truths (6):**
  1. Wirespec budget-allocations.ws defines all 8 endpoints with correct paths and types
  2. Wirespec contracts.ws includes studyHours and studyMoney on ContractInternal types
  3. Kotlin wirespec handler interfaces are generated after Maven build
  4. TypeScript types are generated after npm run generate
  5. BudgetAllocationAuthority enum exists with READ, WRITE, ADMIN values
  6. Domain services are wired as Spring beans via Configuration class
- **Plan 05-02 truths (8):**
  1. Admin can GET /api/budget-allocations?personId=X&year=Y
  2. Admin can GET /api/budget-allocations?eventCode=ABC
  3. Non-admin GET returns only own allocations
  4. Admin can POST /api/budget-allocations/hack-time with daily breakdowns
  5. Admin can POST /api/budget-allocations/study-money with amount and files
  6. Admin can DELETE /api/budget-allocations/{id}
  7. Non-admin receives 403 on mutations
  8. File upload/download endpoints work
- **Key artifacts:** `budget-allocations.ws`, `contracts.ws`, `BudgetAllocationAuthority.kt`, `BudgetAllocationConfiguration.kt`, `BudgetAllocationController.kt`, `BudgetAllocationApiMapper.kt`, `BudgetAllocationControllerTest.kt`
- **Confidence:** HIGH - integration tests pass per STATE.md

### Gap 3: Phase 7 Missing VERIFICATION.md
- **Impact:** EVT-01 through EVT-04 cannot be formally verified
- **Location:** `.planning/phases/07-event-integration/` (no `07-VERIFICATION.md`)
- **Plans to verify:** 07-01 (EVT-01 through EVT-04: event dialog API wiring)
- **Plan 07-01 truths (5):**
  1. Admin opens existing event dialog and sees budget management section populated with saved allocations from API
  2. Admin assigns per-participant time allocations with per-day breakdown that persists
  3. Admin assigns per-participant money allocations that persist
  4. Admin creates FLOCK_HACK_DAY event and budget section defaults to HackTime
  5. Event form changes immediately update budget management sections
- **Key artifacts:** `BudgetAllocationClient.ts`, `eventBudgetTransformers.ts`, `EventDialog.tsx`, `EventBudgetManagementDialog.tsx`
- **Confidence:** HIGH - Phase 7 complete per STATE.md

### Gap 4: DOM-01/DOM-02 Missing from Phase 3 SUMMARY Frontmatter
- **Impact:** Requirements show as "partial" in audit (verified but not in SUMMARY)
- **Location:** Neither `03-01-SUMMARY.md` nor `03-02-SUMMARY.md` have `requirements_completed` frontmatter
- **Fix:** Add `requirements_completed: [DOM-01, DOM-02]` to Phase 3 Plan 02 SUMMARY frontmatter (Plan 02 completed the services/tests, which together with Plan 01's types/ports satisfies both requirements)
- **Confidence:** HIGH - straightforward frontmatter addition

### Gap 5: DOM-03 Checkbox Unchecked in REQUIREMENTS.md
- **Impact:** DOM-03 shows as "unsatisfied" in audit
- **Location:** REQUIREMENTS.md line 12: `- [ ] **DOM-03**: Liquibase migrations...`
- **Fix:** Change `[ ]` to `[x]`
- **Confidence:** HIGH - Liquibase migrations exist and work (Phase 4 Plan 01 completed this)

### Gap 6: downloadFile URL Pattern Mismatch (Code Bug)
- **Impact:** Latent bug in BudgetAllocationClient.ts - not currently user-facing but incorrect
- **Location:** `workday-application/src/main/react/clients/BudgetAllocationClient.ts` line 132-133
- **Current (wrong):** `return \`/api/budget-allocations/files/${fileId}\`` -- generates single path segment
- **Backend expects:** `@GetMapping("/api/budget-allocations/files/{file}/{name}")` -- two path variables (file UUID and filename)
- **Expense pattern reference:** Expense domain uses `/api/expenses/files/{file}/{name}` with same two-segment pattern
- **Fix:** Change to `return \`/api/budget-allocations/files/${fileId}/${fileName}\`` and add `fileName` parameter
- **Confidence:** HIGH - clear mismatch between client and controller

## Architecture Patterns

### VERIFICATION.md Format (from existing files)

All existing VERIFICATION.md files follow this exact structure:

```markdown
---
phase: {phase-slug}
verified: {ISO timestamp}
status: passed
score: {N}/{N} must-haves verified
re_verification: false
---

# Phase {N}: {Name} Verification Report

**Phase Goal:** {goal}
**Verified:** {timestamp}
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths
| # | Truth | Status | Evidence |

### Required Artifacts
| Artifact | Expected | Status | Details |

### Key Link Verification
| From | To | Via | Status | Details |

### Requirements Coverage
| Requirement | Source Plan | Description | Status | Evidence |
```

**Source:** 03-VERIFICATION.md, 06-VERIFICATION.md, 08-VERIFICATION.md (all follow same format)

### SUMMARY Frontmatter Pattern

Summaries that track requirements use `requirements_completed` in frontmatter. Example from 05-02-SUMMARY.md and 08-01-SUMMARY.md format.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verification format | Custom format | Copy exact format from 08-VERIFICATION.md | Consistency with existing 4 verification files |
| Evidence gathering | Guessing | File reads + grep for actual line numbers | Verification must cite concrete evidence |
| Re-audit | Manual counting | Re-run milestone audit process | Ensures 23/23 count is accurate |

## Common Pitfalls

### Pitfall 1: Verification Without Evidence
**What goes wrong:** Creating VERIFICATION.md with "VERIFIED" status but no concrete evidence
**Why it happens:** Tempting to just mark everything passed since we know code works
**How to avoid:** Each truth must cite specific file paths, line numbers, or test output
**Warning signs:** Generic evidence like "code exists" without specifics

### Pitfall 2: Incomplete Frontmatter Fix
**What goes wrong:** Adding requirements_completed to wrong SUMMARY file
**Why it happens:** Phase 3 has two plans (01 and 02), unclear which to update
**How to avoid:** DOM-01 and DOM-02 span both plans. Add to 03-02-SUMMARY.md since it's the final plan that completed the domain layer (services + tests)
**Warning signs:** requirements_completed on Plan 01 only covers types/ports, not full requirements

### Pitfall 3: downloadFile Fix Breaking Callers
**What goes wrong:** Changing function signature without updating all call sites
**Why it happens:** downloadFile is exported but currently orphaned (never called)
**How to avoid:** The audit confirmed downloadFile is exported but never called, so signature change is safe. Still verify with grep.
**Warning signs:** Any import of downloadFile outside BudgetAllocationClient.ts

### Pitfall 4: Forgetting Re-Audit
**What goes wrong:** Claiming 23/23 without actually re-verifying
**Why it happens:** Assuming fixes are sufficient
**How to avoid:** Final task must re-run audit logic and confirm all 23 requirements show as satisfied
**Warning signs:** Skipping the re-audit step

## Code Examples

### downloadFile Fix

Current (broken):
```typescript
// BudgetAllocationClient.ts line 132-133
const downloadFile = (fileId: string): string => {
  return `/api/budget-allocations/files/${fileId}`;
};
```

Fixed (matches backend `@GetMapping("/api/budget-allocations/files/{file}/{name}")`):
```typescript
const downloadFile = (fileId: string, fileName: string): string => {
  return `/api/budget-allocations/files/${fileId}/${fileName}`;
};
```

Reference: Expense domain pattern at `workday-application/src/main/wirespec/expenses.ws` line 32:
```
endpoint ExpenseGetFiles GET /api/expenses/files/{file: String}/{name: String}
```

### REQUIREMENTS.md Checkbox Fix

Line 12 change:
```diff
- - [ ] **DOM-03**: Liquibase migrations create budget_allocation table hierarchy and element collection tables
+ - [x] **DOM-03**: Liquibase migrations create budget_allocation table hierarchy and element collection tables
```

## Files to Modify (Source Code)

| File | Change | Type |
|------|--------|------|
| `workday-application/src/main/react/clients/BudgetAllocationClient.ts` | Fix downloadFile URL pattern | Code bugfix |

## Files to Create (Documentation)

| File | Purpose |
|------|---------|
| `.planning/phases/04-persistence-contract/04-VERIFICATION.md` | Verify DOM-03, DOM-04 |
| `.planning/phases/05-api-layer/05-VERIFICATION.md` | Verify API-01 through API-05, CTR-02 |
| `.planning/phases/07-event-integration/07-VERIFICATION.md` | Verify EVT-01 through EVT-04 |

## Files to Edit (Documentation)

| File | Change |
|------|--------|
| `.planning/REQUIREMENTS.md` line 12 | Change `[ ]` to `[x]` for DOM-03 |
| `.planning/phases/03-domain-layer/03-02-SUMMARY.md` frontmatter | Add `requirements_completed: [DOM-01, DOM-02]` |

## Task Sequencing

The work has natural ordering:

1. **Code fix first** (downloadFile) -- source code change
2. **Documentation fixes** (REQUIREMENTS.md checkbox, SUMMARY frontmatter) -- can be parallel
3. **VERIFICATION.md creation** (Phases 04, 05, 07) -- can be parallel, must cite actual file evidence
4. **Re-audit** -- must be last, validates all gaps closed

Tasks 2 and 3 are independent and can be parallelized. Task 4 depends on all others.

## Open Questions

None. All gaps are well-defined by the milestone audit with clear remediation paths.

## Sources

### Primary (HIGH confidence)
- `.planning/v1.0-MILESTONE-AUDIT.md` - Complete gap inventory with evidence
- `.planning/phases/08-contract-form-dev-data/08-VERIFICATION.md` - Format reference
- `.planning/phases/03-domain-layer/03-VERIFICATION.md` - Format reference
- `.planning/REQUIREMENTS.md` - Current checkbox state
- `workday-application/src/main/react/clients/BudgetAllocationClient.ts` - downloadFile implementation
- `workday-application/src/main/kotlin/.../BudgetAllocationController.kt` - Backend file endpoint path

## Metadata

**Confidence breakdown:**
- Gap inventory: HIGH - directly from milestone audit with evidence
- Verification format: HIGH - 4 existing files as reference
- Code bugfix: HIGH - clear URL path mismatch verified in source
- Task sequencing: HIGH - straightforward dependency chain

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable - documentation remediation)
