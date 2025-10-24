export type UUID = string;
const regExpUUID = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/g;
export const validateUUID = (value: string): value is UUID => 
  regExpUUID.test(value);

export type Todo = {
  "id": UUID,
  "todoType": TodoType,
  "personId": UUID,
  "personName": string,
  "description": string
}


export type TodoType = "WORKDAY" | "SICKDAY" | "HOLIDAY" | "PAID_PARENTAL_LEAVE" | "UNPAID_PARENTAL_LEAVE" | "EXPENSE" | "PLUSDAY"

export type AggregationIdentifier = {
  "id": string,
  "name": string
}


export type AggregationClient = {
  "name": string,
  "revenueGross": number
}


export type AggregationPerson = {
  "id": UUID,
  "name": string,
  "contractTypes": string[],
  "sickDays": number,
  "workDays": number,
  "assignment": number,
  "event": number,
  "total": number,
  "leaveDayUsed": number,
  "leaveDayBalance": number,
  "paidParentalLeaveUsed": number,
  "unpaidParentalLeaveUsed": number,
  "revenue"?: AggregationPersonClientRevenueOverview,
  "cost"?: number
}


export type AggregationClientPersonOverview = {
  "client": AggregationIdentifier,
  "aggregationPerson": AggregationClientPersonItem[],
  "totals": number[]
}


export type AggregationClientPersonAssignmentOverview = {
  "client": AggregationIdentifier,
  "aggregationPersonAssignment": AggregationClientPersonAssignmentItem[],
  "totals": number[]
}


export type AggregationClientPersonItem = {
  "person": AggregationIdentifier,
  "hours": number[],
  "total": number
}


export type AggregationClientPersonAssignmentItem = {
  "person": AggregationIdentifier,
  "assignment": AggregationIdentifier,
  "hours": number[],
  "total": number
}


export type AggregationPersonClientRevenueOverview = {
  "clients": AggregationPersonClientRevenueItem[],
  "total": number
}


export type AggregationPersonClientRevenueItem = {
  "client": AggregationIdentifier,
  "revenue": number
}


export type NonProductiveHours = {
  "sickHours": number,
  "holidayHours": number,
  "paidParentalLeaveHours": number,
  "unpaidParentalLeaveHours": number
}


export type PersonHolidayDetails = {
  "name": string,
  "holidayHoursFromContract": number,
  "plusHours": number,
  "holidayHoursDone": number,
  "holidayHoursApproved": number,
  "holidayHoursRequested": number,
  "totalHoursAvailable": number,
  "totalHoursUsed": number,
  "totalHoursRemaining": number
}


export type PersonHackdayDetails = {
  "name": string,
  "hackHoursFromContract": number,
  "hackHoursUsed": number,
  "totalHoursRemaining": number
}


export type AggregationHackDay = {
  "name": string,
  "contractHours": number,
  "hackHoursUsed": number
}


export type AggregationLeaveDay = {
  "name": string,
  "contractHours": number,
  "plusHours": number,
  "holidayHours": number,
  "paidParentalLeaveHours": number,
  "unpaidParentalLeaveHours": number
}


export type Expense = {
  "id": string,
  "personId": UUID,
  "description": string,
  "date": string,
  "status": Status,
  "expenseType": ExpenseType,
  "costDetails"?: CostExpenseDetails,
  "travelDetails"?: TravelExpenseDetails
}


export type CostExpenseDetails = {
  "amount": number,
  "files": CostExpenseFile[]
}


export type TravelExpenseDetails = {
  "distance": number,
  "allowance": number
}


export type ExpenseType = "TRAVEL" | "COST"

export type CostExpense = {
  "id": string,
  "personId": UUID,
  "description": string,
  "date": string,
  "status": Status,
  "amount": number,
  "files": CostExpenseFile[]
}


export type CostExpenseFile = {
  "name": string,
  "file": UUID
}


export type TravelExpense = {
  "id": string,
  "personId": UUID,
  "description": string,
  "date": string,
  "status": Status,
  "distance": number,
  "allowance": number
}


export type CostExpenseInput = {
  "personId": UUID,
  "description": string,
  "date": string,
  "status": Status,
  "amount": number,
  "files": CostExpenseFileInput[]
}


export type CostExpenseFileInput = {
  "name": string,
  "file": UUID
}


export type TravelExpenseInput = {
  "personId": UUID,
  "description": string,
  "date": string,
  "status": Status,
  "distance": number,
  "allowance": number
}


export type Status = "REQUESTED" | "APPROVED" | "REJECTED" | "DONE"
