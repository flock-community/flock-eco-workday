#!/usr/bin/env bash
# Phase 09 Validation Tests
# Tests behavioral outcomes of verification gap closure phase
set -euo pipefail

ROOT="/Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday"
PASS=0
FAIL=0
ERRORS=""

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); ERRORS="${ERRORS}\n  - $1"; }

echo "=== Phase 09: Verification Gap Closure Validation ==="
echo ""

# ---------------------------------------------------------------------------
# GAP-09-01: downloadFile URL matches backend two-segment pattern
# Requirement: BudgetAllocationClient.downloadFile accepts fileId AND fileName,
#   URL pattern is files/${fileId}/${fileName} matching controller files/{file}/{name}
# ---------------------------------------------------------------------------
echo "[GAP-09-01] downloadFile URL matches backend two-segment pattern"

CLIENT="$ROOT/workday-application/src/main/react/clients/BudgetAllocationClient.ts"
CONTROLLER="$ROOT/workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationController.kt"

# Check client has two parameters
if grep -q 'downloadFile = (fileId: string, fileName: string)' "$CLIENT"; then
  pass "downloadFile accepts both fileId and fileName parameters"
else
  fail "downloadFile does not accept both fileId and fileName parameters"
fi

# Check client URL has two segments
if grep -q 'files/\${fileId}/\${fileName}' "$CLIENT"; then
  pass "downloadFile URL contains two path segments (fileId/fileName)"
else
  fail "downloadFile URL does not contain two path segments"
fi

# Check backend pattern matches
if grep -q 'GetMapping.*files/{file}/{name}' "$CONTROLLER"; then
  pass "Backend controller has matching files/{file}/{name} pattern"
else
  fail "Backend controller missing files/{file}/{name} pattern"
fi

echo ""

# ---------------------------------------------------------------------------
# GAP-09-02: DOM-03 checkbox is marked complete in REQUIREMENTS.md
# ---------------------------------------------------------------------------
echo "[GAP-09-02] DOM-03 checkbox is marked complete"

REQS="$ROOT/.planning/REQUIREMENTS.md"

if grep -q '\[x\] \*\*DOM-03\*\*' "$REQS"; then
  pass "DOM-03 checkbox is [x] in REQUIREMENTS.md"
else
  fail "DOM-03 checkbox is not [x] in REQUIREMENTS.md"
fi

echo ""

# ---------------------------------------------------------------------------
# GAP-09-03: All 23 v1 requirements have [x] checkboxes
# ---------------------------------------------------------------------------
echo "[GAP-09-03] All 23 v1 requirements are checked"

CHECKED=$(grep -c '\[x\]' "$REQS" || true)
UNCHECKED=$(grep -c '\[ \]' "$REQS" || true)

if [ "$CHECKED" -eq 23 ]; then
  pass "Found exactly 23 [x] checkboxes in REQUIREMENTS.md"
else
  fail "Expected 23 [x] checkboxes, found $CHECKED"
fi

if [ "$UNCHECKED" -eq 0 ]; then
  pass "No unchecked [ ] boxes remain in v1 section"
else
  fail "Found $UNCHECKED unchecked [ ] boxes"
fi

echo ""

# ---------------------------------------------------------------------------
# GAP-09-04: Phase 3 SUMMARY has requirements_completed for DOM-01, DOM-02
# ---------------------------------------------------------------------------
echo "[GAP-09-04] Phase 3 SUMMARY frontmatter has requirements_completed"

SUMMARY03="$ROOT/.planning/phases/03-domain-layer/03-02-SUMMARY.md"

if grep -q 'requirements_completed:.*DOM-01.*DOM-02' "$SUMMARY03" || \
   grep -q 'requirements_completed: \[DOM-01, DOM-02\]' "$SUMMARY03"; then
  pass "03-02-SUMMARY.md has requirements_completed with DOM-01 and DOM-02"
else
  fail "03-02-SUMMARY.md missing requirements_completed for DOM-01/DOM-02"
fi

echo ""

# ---------------------------------------------------------------------------
# GAP-09-05: Phase 04 VERIFICATION.md exists with passed status for DOM-03, DOM-04
# ---------------------------------------------------------------------------
echo "[GAP-09-05] Phase 04 VERIFICATION.md exists and covers DOM-03, DOM-04"

V04="$ROOT/.planning/phases/04-persistence-contract/04-VERIFICATION.md"

if [ -f "$V04" ]; then
  pass "04-VERIFICATION.md exists"
else
  fail "04-VERIFICATION.md does not exist"
fi

if grep -q 'status: passed' "$V04" 2>/dev/null; then
  pass "04-VERIFICATION.md has status: passed"
else
  fail "04-VERIFICATION.md missing status: passed"
fi

if grep -q 'DOM-03' "$V04" 2>/dev/null && grep -q 'DOM-04' "$V04" 2>/dev/null; then
  pass "04-VERIFICATION.md references both DOM-03 and DOM-04"
else
  fail "04-VERIFICATION.md does not reference both DOM-03 and DOM-04"
fi

echo ""

# ---------------------------------------------------------------------------
# GAP-09-06: Phase 05 VERIFICATION.md exists with passed status for API-01-05, CTR-02
# ---------------------------------------------------------------------------
echo "[GAP-09-06] Phase 05 VERIFICATION.md exists and covers API-01-05, CTR-02"

V05="$ROOT/.planning/phases/05-api-layer/05-VERIFICATION.md"

if [ -f "$V05" ]; then
  pass "05-VERIFICATION.md exists"
else
  fail "05-VERIFICATION.md does not exist"
fi

if grep -q 'status: passed' "$V05" 2>/dev/null; then
  pass "05-VERIFICATION.md has status: passed"
else
  fail "05-VERIFICATION.md missing status: passed"
fi

ALL_FOUND=true
for REQ in API-01 API-02 API-03 API-04 API-05 CTR-02; do
  if ! grep -q "$REQ" "$V05" 2>/dev/null; then
    ALL_FOUND=false
    fail "05-VERIFICATION.md missing $REQ"
  fi
done
if [ "$ALL_FOUND" = true ]; then
  pass "05-VERIFICATION.md references all 6 requirements (API-01-05, CTR-02)"
fi

echo ""

# ---------------------------------------------------------------------------
# GAP-09-07: Phase 07 VERIFICATION.md exists with passed status for EVT-01-04
# ---------------------------------------------------------------------------
echo "[GAP-09-07] Phase 07 VERIFICATION.md exists and covers EVT-01-04"

V07="$ROOT/.planning/phases/07-event-integration/07-VERIFICATION.md"

if [ -f "$V07" ]; then
  pass "07-VERIFICATION.md exists"
else
  fail "07-VERIFICATION.md does not exist"
fi

if grep -q 'status: passed' "$V07" 2>/dev/null; then
  pass "07-VERIFICATION.md has status: passed"
else
  fail "07-VERIFICATION.md missing status: passed"
fi

ALL_FOUND=true
for REQ in EVT-01 EVT-02 EVT-03 EVT-04; do
  if ! grep -q "$REQ" "$V07" 2>/dev/null; then
    ALL_FOUND=false
    fail "07-VERIFICATION.md missing $REQ"
  fi
done
if [ "$ALL_FOUND" = true ]; then
  pass "07-VERIFICATION.md references all 4 requirements (EVT-01-04)"
fi

echo ""

# ---------------------------------------------------------------------------
# GAP-09-08: VERIFICATION.md files contain concrete evidence (not generic)
# ---------------------------------------------------------------------------
echo "[GAP-09-08] VERIFICATION.md files contain concrete line-number evidence"

# Each VERIFICATION.md should cite actual file paths and line numbers
HAS_EVIDENCE=true
for VFILE in "$V04" "$V05" "$V07"; do
  BASENAME=$(basename "$VFILE")
  if grep -qE 'line [0-9]+' "$VFILE" 2>/dev/null || grep -qE 'Line [0-9]+' "$VFILE" 2>/dev/null; then
    pass "$BASENAME contains line-number evidence"
  else
    fail "$BASENAME lacks line-number evidence (may be generic)"
    HAS_EVIDENCE=false
  fi
done

echo ""

# ---------------------------------------------------------------------------
# GAP-09-09: Total VERIFICATION.md count across all phases is >= 6
# ---------------------------------------------------------------------------
echo "[GAP-09-09] At least 6 VERIFICATION.md files exist across phases"

VCOUNT=$(find "$ROOT/.planning/phases" -name "*VERIFICATION.md" 2>/dev/null | wc -l | tr -d ' ')

if [ "$VCOUNT" -ge 6 ]; then
  pass "Found $VCOUNT VERIFICATION.md files (>= 6 required)"
else
  fail "Found only $VCOUNT VERIFICATION.md files (need >= 6)"
fi

echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
TOTAL=$((PASS + FAIL))
echo "=== RESULTS ==="
echo "  Total: $TOTAL  |  Passed: $PASS  |  Failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo -e "\nFailures:$ERRORS"
  exit 1
else
  echo "  All tests passed."
  exit 0
fi
