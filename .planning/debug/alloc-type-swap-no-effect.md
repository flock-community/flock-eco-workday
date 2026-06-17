---
status: investigating
slug: alloc-type-swap-no-effect
trigger: "After backend restart with ALLOC-04 fix, changing event type from FLOCK_HACK_DAY to CONFERENCE does not swap budget allocation type. API still returns HACK_TIME regardless of event type."
created: 2026-05-27T00:00:00Z
updated: 2026-05-27T00:00:00Z
---

## Current Focus

hypothesis: "budgetAllocationService.deleteById() via BudgetAllocationPersistenceAdapter does not actually delete the HackTimeBudgetAllocationEntity from the database due to JOINED inheritance + base repository behavior"
test: "Check if delete call on BudgetAllocationRepository correctly removes both budget_allocation and hack_time_budget_allocation rows"
expecting: "DELETE SQL issued for both tables; after delete, findAllByEventCode returns empty for that person"
next_action: "Trace the delete path: BudgetAllocationPersistenceAdapter.delete → repository.findByIdOrNull → repository.delete. Confirm JOINED inheritance resolves to correct subtype for deletion. Also check if @Transactional class-level on EventService causes flush-ordering issues that prevent the delete."
reasoning_checkpoint: ""

## Symptoms

expected: "After changing event type from FLOCK_HACK_DAY to CONFERENCE and saving, the budget allocation for participants should change from HACK_TIME to STUDY_TIME (new id, studyTimeDetails populated)"
actual: "Budget allocation remains HACK_TIME with same id (171) regardless of how event type is set. API returns type=HACK_TIME with studyTimeDetails=null."
errors: "No errors thrown — delete silently fails"
timeline: "After deploying ALLOC-04 fix (commit 4e7d8ec2) and restarting backend"
reproduction: "Open any FLOCK_HACK_DAY event with participants. Change event type to CONFERENCE. Save. Check /budget-allocations API for a participant."

## Evidence

- timestamp: 2026-05-27T00:00:00Z
  type: code_read
  finding: "EventService is @Transactional at class level (line 35). All methods including update() run in a single transaction."

- timestamp: 2026-05-27T00:00:00Z
  type: code_read
  finding: "BudgetAllocationPersistenceAdapter.delete(id) calls repository.findByIdOrNull(id) then repository.delete(entity). Uses BudgetAllocationRepository which is JpaRepository<BudgetAllocationEntity, Long>."

- timestamp: 2026-05-27T00:00:00Z
  type: code_read
  finding: "BudgetAllocationEntity uses @Inheritance(strategy = InheritanceType.JOINED). No @DiscriminatorColumn. Subtypes: HackTimeBudgetAllocationEntity, StudyTimeBudgetAllocationEntity, StudyMoneyBudgetAllocationEntity."

- timestamp: 2026-05-27T00:00:00Z
  type: code_read
  finding: "EventService.syncBudgetAllocations filters existing allocations with 'it is HackTimeBudgetAllocation || it is StudyTimeBudgetAllocation' — domain type check. BudgetAllocationMapper.toBudgetAllocationDomain() correctly maps subtypes."

- timestamp: 2026-05-27T00:00:00Z
  type: api_response
  finding: "API response before restart showed type=HACK_TIME, id=171, dailyAllocations[0].type=STUDY — fingerprint of old in-place update code. After restart, user still cannot change allocation type."

- timestamp: 2026-05-27T00:00:00Z
  type: api_response
  finding: "User reports allocation sticks to 1 allocation regardless of event type. Cannot get mix of HACK and STUDY time."

## Eliminated

- hypothesis: "Old backend code was running (pre-fix)"
  reason: "Backend was restarted. Source file confirmed to have new delete-recreate code (existingTimeAllocations variable at line 243)."
  eliminated_at: 2026-05-27T00:00:00Z

- hypothesis: "EventForm.defaultTimeAllocationType mismatch (UI sends STUDY, wirespec expects STUDY_TIME)"
  reason: "EventForm uses String? not typed enum. EventService.isHack checks listOf('HACK', 'HACK_TIME') — STUDY correctly yields isHack=false."
  eliminated_at: 2026-05-27T00:00:00Z

## Resolution

root_cause: ""
fix: ""
verification: ""
files_changed: []
