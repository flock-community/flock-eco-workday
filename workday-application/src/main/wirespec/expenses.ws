endpoint TravelExpenseUpdate PUT TravelExpenseInput /api/expenses-travel/{ id: String } -> {
  200 -> Expense
  500 -> Error
}
endpoint CostExpenseUpdate PUT CostExpenseInput /api/expenses-cost/{ id: String } -> {
  200 -> Expense
  500 -> Error
}
endpoint ExpenseFilesCreate POST PostFilesRequestBody /api/expenses/files -> {
  200 -> String
}
endpoint TravelExpenseCreate POST TravelExpenseInput /api/expenses-travel -> {
  200 -> Expense
  500 -> Error
}
endpoint CostExpenseCreate POST CostExpenseInput /api/expenses-cost -> {
  200 -> Expense
  500 -> Error
}
endpoint ExpenseAll GET /api/expenses ? { personId: String, page: Integer32, size: Integer32, sort: String[] } -> {
  200 -> Expense[] # { ...TotalCount }
}
endpoint ExpenseById GET /api/expenses/{id: String} -> {
  200 -> Expense
  404 -> Error
}
endpoint ExpenseDeleteById DELETE /api/expenses/{id: String} -> {
  204 -> Unit
  404 -> Error
}

endpoint ExpenseGetFiles GET /api/expenses/files/{file: String}/{name: String} -> {
  200 -> Bytes # { `Content-Type`: String, justTesting: String}
}

// Fields every kind of expense has
part ExpenseBase {
  personId: UUID,
  description: String?,
  date: String?,
  status: ExpenseStatus
}

// Distance travelled and the allowance paid for it
part TravelDistance {
  distance: Number?,
  allowance: Number?
}

// A file attached to a cost expense
part ExpenseFile {
  name: String,
  file: UUID
}

type TravelExpenseInput {
  ...ExpenseBase,
  ...TravelDistance
}
type CostExpenseDetails {
  amount: Number,
  files: CostExpenseFile[]
}
type CostExpenseFile {
  ...ExpenseFile
}
type Expense {
  id: String?,
  ...ExpenseBase,
  expenseType: ExpenseType?,
  costDetails: CostExpenseDetails?,
  travelDetails: TravelExpenseDetails?
}
enum ExpenseType {
  TRAVEL, COST
}
type TravelExpenseDetails {
  ...TravelDistance
}
type CostExpenseFileInput {
  ...ExpenseFile
}
type CostExpenseInput {
  personId: UUID,
  description: String,
  date: String,
  status: ExpenseStatus,
  amount: Number,
  files: CostExpenseFileInput[]
}
enum ExpenseStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
type PostFilesRequestBody {
  file: Bytes
}
