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
endpoint HackTimeAllocationCreate POST HackTimeAllocationInput /api/budget-allocations/hack-time -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint HackTimeAllocationUpdate PUT HackTimeAllocationInput /api/budget-allocations/hack-time/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint TrainingTimeAllocationCreate POST TrainingTimeAllocationInput /api/budget-allocations/training-time -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint TrainingTimeAllocationUpdate PUT TrainingTimeAllocationInput /api/budget-allocations/training-time/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint TrainingMoneyAllocationCreate POST TrainingMoneyAllocationInput /api/budget-allocations/training-money -> {
  200 -> BudgetAllocation
  500 -> Error
}
endpoint TrainingMoneyAllocationUpdate PUT TrainingMoneyAllocationInput /api/budget-allocations/training-money/{id: String} -> {
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
  trainingTimeDetails: TrainingTimeDetails?,
  trainingMoneyDetails: TrainingMoneyDetails?
}
enum BudgetAllocationType {
  HACK_TIME, TRAINING_TIME, TRAINING_MONEY
}
type HackTimeDetails {
  totalHours: Number,
  dailyAllocations: DailyTimeAllocationItem[]
}
type TrainingTimeDetails {
  totalHours: Number,
  dailyAllocations: DailyTimeAllocationItem[]
}
type TrainingMoneyDetails {
  amount: Number,
  files: BudgetAllocationFile[]
}
type DailyTimeAllocationItem {
  date: String,
  hours: Number,
  `type`: DailyAllocationType
}
enum DailyAllocationType {
  TRAINING, HACK
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
type TrainingTimeAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  dailyAllocations: DailyTimeAllocationItem[]
}
type TrainingMoneyAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  amount: Number,
  files: BudgetAllocationFile[]
}
