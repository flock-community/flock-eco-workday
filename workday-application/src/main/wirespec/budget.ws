endpoint BudgetSummary GET /api/budget-summary ? {personId: String?, year: Integer32?} -> {
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
