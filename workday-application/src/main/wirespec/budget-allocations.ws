endpoint BudgetSummary GET /api/budget-summary ? { personId: String?, year: Integer32? } -> {
  200 -> BudgetSummaryResponse
}

type BudgetSummaryResponse {
  hackTimeBudget: BudgetItem,
  trainingTimeBudget: BudgetItem,
  trainingMoneyBudget: BudgetItem
}

type BudgetItem {
  budget: Number,
  used: Number,
  available: Number
}

endpoint BudgetAllocationAll GET /api/budget-allocations ? { personId: String?, year: Integer32?, eventCode: String? } -> {
  200 -> BudgetAllocation[]
}
endpoint BudgetAllocationDeleteById DELETE /api/budget-allocations/{id: String} -> {
  204 -> Unit
  404 -> Error
}
endpoint TimeAllocationCreate POST TimeAllocationInput /api/budget-allocations/time -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint TimeAllocationUpdate PUT TimeAllocationInput /api/budget-allocations/time/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint MoneyAllocationCreate POST MoneyAllocationInput /api/budget-allocations/money -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint MoneyAllocationUpdate PUT MoneyAllocationInput /api/budget-allocations/money/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}

type BudgetAllocation {
  id: String?,
  personId: String,
  eventCode: String?,
  date: String,
  description: String?,
  kind: AllocationKind,
  timeDetails: TimeAllocationDetails?,
  moneyDetails: MoneyAllocationDetails?
}
enum AllocationKind {
  TIME, MONEY
}
enum AllocationType {
  HACK, TRAINING
}
type TimeAllocationDetails {
  totalHours: Number,
  dailyAllocations: DailyTimeAllocationItem[]
}
type MoneyAllocationDetails {
  amount: Number,
  files: BudgetAllocationFile[]
}
type DailyTimeAllocationItem {
  date: String,
  hours: Number,
  `type`: AllocationType
}
type BudgetAllocationFile {
  name: String,
  file: UUID
}
type TimeAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  dailyAllocations: DailyTimeAllocationItem[]
}
type MoneyAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  amount: Number,
  files: BudgetAllocationFile[]
}
