---
phase: 08-contract-form-dev-data
validated: 2026-03-17
status: partial
resolved: 2/2 tests created
executed: 0/2 (sandbox blocked test execution)
---

# Phase 08: Contract Form & Dev Data - VALIDATION

## Verification Map

| Task ID | Requirement | Test Type | Test File | Automated Command | Status |
|---------|-------------|-----------|-----------|-------------------|--------|
| CTR-01 | Contract form shows studyHours and studyMoney fields for internal contracts | Unit (Jest) | `workday-application/src/main/react/features/contract/ContractFormInternal.test.tsx` | `npm test -- --testPathPattern="ContractFormInternal.test" --no-coverage` | created (not yet run) |
| DEV-01 | Mock data loader seeds budget allocations for development profile | Smoke (grep) | N/A (structural verification commands below) | See commands below | created (not yet run) |

## CTR-01: Contract Form Study Budget Fields

**Test file:** `workday-application/src/main/react/features/contract/ContractFormInternal.test.tsx`

**What it validates:**
- `studyHours` number input field renders on the internal contract form
- `studyMoney` number input field renders on the internal contract form
- Existing contract values populate into studyHours and studyMoney fields (init object binding)
- New contracts default studyHours=0 and studyMoney=0 (Yup schema defaults)
- All three budget fields (hackHours, studyHours, studyMoney) render together

**Run command:**
```bash
npm test -- --testPathPattern="ContractFormInternal.test" --no-coverage
```

**Conventions followed:**
- Uses `@testing-library/react` + `@testing-library/jest-dom` (same as EventBudgetSummaryBanner.test.tsx)
- File placed alongside component (same pattern as existing tests)
- Behavioral test names describing user-observable outcomes

## DEV-01: Budget Allocation Dev Data Loader

**Structural verification commands (smoke tests):**

```bash
# 1. LoadBudgetAllocationData exists and follows Spring component pattern
grep -q "@Component" workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt && echo "PASS: @Component annotation" || echo "FAIL"

# 2. All 3 allocation entity types are seeded
grep -c "HackTimeBudgetAllocationEntity\|StudyTimeBudgetAllocationEntity\|StudyMoneyBudgetAllocationEntity" workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt | grep -q "[3-9]" && echo "PASS: All 3 entity types" || echo "FAIL"

# 3. 3 persons are seeded (ieniemienie, pino, bert)
grep -c "ieniemienie\|pino\|bert" workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt | grep -q "3" && echo "PASS: 3 persons" || echo "FAIL"

# 4. Prior year and current year data exist
grep -c "priorYear\|currentYear" workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt | grep -q "[4-9]" && echo "PASS: Multi-year data" || echo "FAIL"

# 5. Event-linked and standalone allocations exist
grep -q "eventCode = hackDayEvents" workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt && grep -q "eventCode = null" workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt && echo "PASS: Event-linked and standalone" || echo "FAIL"

# 6. LoadContractData has studyHours and studyMoney values
grep -c "studyHours\|studyMoney" workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadContractData.kt | grep -q "[4-9]" && echo "PASS: Contract budget values" || echo "FAIL"

# 7. Full compile check (most authoritative)
cd workday-application && ../mvnw compile -Pdevelop -q && echo "PASS: Compiles with -Pdevelop" || echo "FAIL"
```

## Execution Notes

**Sandbox limitation:** The test execution environment blocked all `npm`, `node`, `npx`, and `mvn` commands. Test files were created and structurally validated but could not be executed. The user must run the commands above manually to complete validation.

## Compliance Summary

| Requirement | Artifact Exists | Test Created | Test Executed | Status |
|-------------|----------------|--------------|---------------|--------|
| CTR-01 | Yes (ContractFormInternal.tsx has 6+ studyHours/studyMoney refs) | Yes | No (sandbox blocked) | awaiting-execution |
| DEV-01 | Yes (LoadBudgetAllocationData.kt: 237 lines, all 3 types, 3 persons, 2 years) | Yes (smoke commands) | No (sandbox blocked) | awaiting-execution |

---
*Validated: 2026-03-17*
*Auditor: Claude (gsd-nyquist-auditor)*
