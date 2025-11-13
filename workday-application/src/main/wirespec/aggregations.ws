endpoint TotalsPerPersonByYear_1 GET /api/aggregations/total-per-person ? {year: Integer32,month: Integer32} -> {
  200 -> AggregationPerson[]
}
endpoint TotalsPerPersonMeByYearMonth GET /api/aggregations/total-per-person-me -> {
  200 -> { AggregationPerson }
}
endpoint TotalsPerMonthByYear GET /api/aggregations/total-per-month ? {year: Integer32} -> {
  200 -> AggregationMonth[]
}
endpoint RevenuePerClientByYear GET /api/aggregations/total-per-client ? {year: Integer32} -> {
  200 -> AggregationClient[]
}
endpoint PersonNonProductiveHoursPerDay GET /api/aggregations/person-nonproductive-hours-per-day ? {personId: String,from: String,to: String} -> {
  200 -> NonProductiveHours[]
}
endpoint LeaveDayReportByYear GET /api/aggregations/leave-day-report ? {year: Integer32} -> {
  200 -> AggregationLeaveDay[]
}
endpoint LeaveDayReportMeByYear GET /api/aggregations/leave-day-report-me ? {year: Integer32} -> {
  200 -> AggregationLeaveDay
}
endpoint HolidayDetailsMeYear GET /api/aggregations/holiday-details-me ? {year: Integer32} -> {
  200 -> PersonHolidayDetails
}
endpoint HackdayDetailsMeYear GET /api/aggregations/hackday-details-me ? {year: Integer32} -> {
  200 -> PersonHackdayDetails
}
endpoint HackDayReportByYear GET /api/aggregations/hack-day-report ? {year: Integer32} -> {
  200 -> AggregationHackDay[]
}
endpoint HourClientOverviewEmployee GET /api/aggregations/client-hour-overview ? {year: Integer32,month: Integer32} -> {
  200 -> AggregationClientPersonOverview[]
}
endpoint HourAssignmentClientOverviewEmployee GET /api/aggregations/client-assignment-hour-overview ? {from: String,to: String} -> {
  200 -> AggregationClientPersonAssignmentOverview[]
}

type TotalsPerPersonMeByYearMonth200ResponseBody {
  id: String?,
  name: String?,
  contractTypes: String[]?,
  sickDays: Number?,
  workDays: Number?,
  assignment: Integer32?,
  event: Integer32?,
  total: Integer32?,
  leaveDayUsed: Number?,
  leaveDayBalance: Number?,
  paidParentalLeaveUsed: Number?,
  unpaidParentalLeaveUsed: Number?,
  revenue: AggregationPersonClientRevenueOverview?,
  cost: Number?
}
type AggregationIdentifier {
  id: String?,
  name: String?
}
type AggregationPerson {
  id: String?,
  name: String?,
  contractTypes: String[]?,
  sickDays: Number?,
  workDays: Number?,
  assignment: Integer32?,
  event: Integer32?,
  total: Integer32?,
  leaveDayUsed: Number?,
  leaveDayBalance: Number?,
  paidParentalLeaveUsed: Number?,
  unpaidParentalLeaveUsed: Number?,
  revenue: AggregationPersonClientRevenueOverview?,
  cost: Number?
}
type AggregationPersonClientRevenueItem {
  client: AggregationIdentifier?,
  revenue: Number?
}
type AggregationPersonClientRevenueOverview {
  clients: AggregationPersonClientRevenueItem[]?,
  total: Number?
}
type AggregationMonth {
  yearMonth: String?,
  countContractInternal: Integer32?,
  countContractManagement: Integer32?,
  countContractExternal: Integer32?,
  forecastRevenueGross: Number?,
  forecastRevenueNet: Number?,
  forecastHoursGross: Number?,
  actualRevenue: Number?,
  actualHours: Number?,
  actualCostContractInternal: Number?,
  actualCostContractExternal: Number?,
  actualCostContractManagement: Number?,
  actualCostContractService: Number?,
  actualRevenueInternal: Number?,
  actualRevenueExternal: Number?,
  actualRevenueManagement: Number?
}
type AggregationClient {
  name: String?,
  revenueGross: Number?
}
type NonProductiveHours {
  sickHours: Number?,
  holidayHours: Number?,
  paidParentalLeaveHours: Number?,
  unpaidParentalLeaveHours: Number?
}
type AggregationLeaveDay {
  name: String?,
  contractHours: Number?,
  plusHours: Number?,
  holidayHours: Number?,
  paidParentalLeaveHours: Number?,
  unpaidParentalLeaveHours: Number?
}
type PersonHolidayDetails {
  name: String?,
  holidayHoursFromContract: Number?,
  plusHours: Number?,
  holidayHoursDone: Number?,
  holidayHoursApproved: Number?,
  holidayHoursRequested: Number?,
  totalHoursAvailable: Number?,
  totalHoursUsed: Number?,
  totalHoursRemaining: Number?
}
type PersonHackdayDetails {
  name: String?,
  hackHoursFromContract: Number?,
  hackHoursUsed: Number?,
  totalHoursRemaining: Number?
}
type AggregationHackDay {
  name: String?,
  contractHours: Number?,
  hackHoursUsed: Number?
}
type AggregationClientPersonItem {
  person: AggregationIdentifier?,
  hours: Number[]?,
  total: Number?
}
type AggregationClientPersonOverview {
  client: AggregationIdentifier?,
  aggregationPerson: AggregationClientPersonItem[]?,
  totals: Number[]?
}
type AggregationClientPersonAssignmentItem {
  person: AggregationIdentifier?,
  assignment: AggregationIdentifier?,
  hours: Number[]?,
  total: Number?
}
type AggregationClientPersonAssignmentOverview {
  client: AggregationIdentifier?,
  aggregationPersonAssignment: AggregationClientPersonAssignmentItem[]?,
  totals: Number[]?
}
