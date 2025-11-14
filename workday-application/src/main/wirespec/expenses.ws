endpoint PutTravelExpense PUT TravelExpenseInput /api/expenses-travel/{id: String} -> {
  200 -> Expense
}
endpoint PutCostExpense PUT CostExpenseInput /api/expenses-cost/{id: String} -> {
  200 -> Expense
}
endpoint PostFiles POST PostFilesRequestBody /api/expenses/files -> {
  200 -> String
}
endpoint PostTravelExpense POST TravelExpenseInput /api/expenses-travel -> {
  200 -> Expense
}
endpoint PostCostExpense POST CostExpenseInput /api/expenses-cost -> {
  200 -> Expense
}
endpoint GetExpenseAll GET /api/expenses ? {personId: String,pageable: Pageable} -> {
  200 -> Expense[]
}
endpoint GetExpenseById GET /api/expenses/{id: String} -> {
  200 -> Expense
}
endpoint DeleteExpenseById DELETE /api/expenses/{id: String} -> {
  200 -> Unit
}
endpoint GetFiles GET /api/expenses/files/{file: String}/{name: String} -> {
  200 -> String[]
}

type TravelExpenseInput {
  personId: UUID,
  description: String?,
  date: String?,
  status: ExpenseStatus,
  distance: Number?,
  allowance: Number?
}
type CostExpenseDetails {
  amount: Number,
  files: CostExpenseFile[]
}
type CostExpenseFile {
  name: String,
  file: UUID
}
type Expense {
  id: String?,
  personId: UUID,
  description: String?,
  date: String?,
  status: ExpenseStatus,
  expenseType: ExpenseType?,
  costDetails: CostExpenseDetails?,
  travelDetails: TravelExpenseDetails?
}
enum ExpenseType {
  TRAVEL, COST
}
type TravelExpenseDetails {
  distance: Number?,
  allowance: Number?
}
type CostExpenseFileInput {
  name: String,
  file: UUID
}
type CostExpenseInput {
  personId: UUID,
  description: String?,
  date: String?,
  status: ExpenseStatus,
  amount: Number?,
  files: CostExpenseFileInput[]
}
enum ExpenseStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
type PostFilesRequestBody {
  file: String
}
