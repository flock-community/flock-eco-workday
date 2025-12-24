type UUID /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/g

type Todo {
    id:UUID,
    todoType: TodoType,
    personId: UUID,
    personName: String,
    description: String
}

enum TodoType {
    WORKDAY,
    SICKDAY,
    HOLIDAY,
    PAID_PARENTAL_LEAVE,
    UNPAID_PARENTAL_LEAVE,
    EXPENSE,
    PLUSDAY,
    PAID_LEAVE
}

type AggregationIdentifier {
    id: String,
    name: String
}

type AggregationClient {
    name: String,
    revenueGross: Number
}


type AggregationPerson {
    id: UUID,
    name: String,
    contractTypes: String[],
    sickDays: Number,
    workDays: Number,
    assignment: Number,
    event: Number,
    total: Number,
    leaveDayUsed: Number,
    leaveDayBalance: Number,
    paidParentalLeaveUsed: Number,
    unpaidParentalLeaveUsed: Number,
    revenue: AggregationPersonClientRevenueOverview?,
    cost: Number?
}



type AggregationClientPersonOverview {
    client: AggregationIdentifier,
    aggregationPerson: AggregationClientPersonItem[],
    totals: Number[]
}

type AggregationClientPersonAssignmentOverview {
    client: AggregationIdentifier,
    aggregationPersonAssignment: AggregationClientPersonAssignmentItem[],
    totals: Number[]
}

type AggregationClientPersonItem {
    person: AggregationIdentifier,
    hours: Number[],
    total: Number
}

type AggregationClientPersonAssignmentItem {
    person: AggregationIdentifier,
    assignment: AggregationIdentifier,
    hours: Number[],
    total: Number
}

type AggregationPersonClientRevenueOverview {
    clients: AggregationPersonClientRevenueItem[],
    total: Number
}

type AggregationPersonClientRevenueItem {
    client: AggregationIdentifier,
    revenue: Number
}


type NonProductiveHours{
    sickHours: Number,
    holidayHours: Number,
    paidParentalLeaveHours: Number,
    unpaidParentalLeaveHours: Number,
    paidLeaveHours: Number
}

type PersonHolidayDetails{
    name: String,
    holidayHoursFromContract: Number,
    plusHours: Number,
    holidayHoursDone: Number,
    holidayHoursApproved: Number,
    holidayHoursRequested: Number,
    totalHoursAvailable: Number,
    totalHoursUsed: Number,
    totalHoursRemaining: Number
}

type PersonHackdayDetails{
    name: String,
    hackHoursFromContract: Number,
    hackHoursUsed: Number,
    totalHoursRemaining: Number
}

type AggregationHackDay {
    name: String,
    contractHours: Number,
    hackHoursUsed: Number
}

type AggregationLeaveDay {
    name: String,
    contractHours: Number,
    plusHours: Number,
    holidayHours: Number,
    paidParentalLeaveHours: Number,
    unpaidParentalLeaveHours: Number,
    paidLeaveHours: Number
}

type Expense {
    id: String,
    personId: UUID,
    description: String,
    date: String,
    status: Status,
    expenseType: ExpenseType,
    costDetails: CostExpenseDetails?,
    travelDetails: TravelExpenseDetails?
    }

type CostExpenseDetails{
    amount: Number,
    files: CostExpenseFile[]
}
type TravelExpenseDetails{
    distance: Number,
    allowance: Number
}

enum ExpenseType {
    TRAVEL,
    COST
}

type CostExpense {
    id: String,
    personId: UUID,
    description: String,
    date: String,
    status: Status,
    amount: Number,
    files: CostExpenseFile[]
}

type CostExpenseFile {
    name:String,
    file: UUID
}

type TravelExpense {
    id: String,
    personId: UUID,
    description: String,
    date: String,
    status: Status,
    distance: Number,
    allowance: Number
}

type CostExpenseInput {
    personId: UUID,
    description: String,
    date: String,
    status: Status,
    amount: Number,
    files: CostExpenseFileInput[]
}

type CostExpenseFileInput {
    name: String,
    file: UUID
}

type TravelExpenseInput {
    personId: UUID,
    description: String,
    date: String,
    status: Status,
    distance: Number,
    allowance: Number
}

enum Status {
    REQUESTED,
    APPROVED,
    REJECTED,
    DONE
}
