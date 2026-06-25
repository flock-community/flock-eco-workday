endpoint BudgetSummary GET /api/budget-summary ? {personId: String?, year: Integer32?} -> {
  200 -> BudgetSummaryResponse
}

type BudgetSummaryResponse {
  hackTimeBudget: BudgetItem,
  trainingTimeBudget: BudgetItem,
  trainingMoneyBudget: BudgetItem,
  events: BudgetEvent[]
}
type BudgetItem {
  budget: Number,
  used: Number,
  available: Number
}
type BudgetEvent {
  eventCode: String,
  description: String,
  from: String,
  hours: Number,
  cost: Number?,
  category: String
}
