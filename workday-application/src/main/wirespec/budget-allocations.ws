endpoint BudgetAllocationAll GET /api/budget-allocations ? { personId: String?, year: Integer32?, eventCode: String? } -> {
  200 -> BudgetAllocation[]
}
endpoint BudgetAllocationDeleteById DELETE /api/budget-allocations/{id: String} -> {
  204 -> Unit
  404 -> Error
}
endpoint HackTimeAllocationCreate POST HackTimeAllocationInput /api/budget-allocations/hack-time -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint HackTimeAllocationUpdate PUT HackTimeAllocationInput /api/budget-allocations/hack-time/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint StudyTimeAllocationCreate POST StudyTimeAllocationInput /api/budget-allocations/study-time -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint StudyTimeAllocationUpdate PUT StudyTimeAllocationInput /api/budget-allocations/study-time/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint StudyMoneyAllocationCreate POST StudyMoneyAllocationInput /api/budget-allocations/study-money -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint StudyMoneyAllocationUpdate PUT StudyMoneyAllocationInput /api/budget-allocations/study-money/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}

type BudgetAllocation {
  id: String?,
  personId: String,
  eventCode: String?,
  date: String,
  description: String?,
  `type`: BudgetAllocationType,
  hackTimeDetails: HackTimeDetails?,
  studyTimeDetails: StudyTimeDetails?,
  studyMoneyDetails: StudyMoneyDetails?
}
enum BudgetAllocationType {
  HACK_TIME, STUDY_TIME, STUDY_MONEY
}
type HackTimeDetails {
  totalHours: Number,
  dailyAllocations: DailyTimeAllocationItem[]
}
type StudyTimeDetails {
  totalHours: Number,
  dailyAllocations: DailyTimeAllocationItem[]
}
type StudyMoneyDetails {
  amount: Number,
  files: BudgetAllocationFile[]
}
type DailyTimeAllocationItem {
  date: String,
  hours: Number,
  `type`: DailyAllocationType
}
enum DailyAllocationType {
  STUDY, HACK
}
type BudgetAllocationFile {
  name: String,
  file: UUID
}
type HackTimeAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  dailyAllocations: DailyTimeAllocationItem[]
}
type StudyTimeAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  dailyAllocations: DailyTimeAllocationItem[]
}
type StudyMoneyAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  amount: Number,
  files: BudgetAllocationFile[]
}
