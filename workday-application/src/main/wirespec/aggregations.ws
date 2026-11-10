endpoint TotalsPerPersonByYear GET /api/aggregations/total-per-person ? {year: Integer32, month: Integer32?} -> {
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
/**
  * Report per person over a period of months, with the figures summed over the period and per month.
  *
  * from, to: first and last month of the period as yyyy-MM, both inclusive. Without from the report starts
  *   at the first month there is data for, without to it ends at the current month.
  * personId: uuid of a person. Without it the report has every person with data in the period.
  *
  * How the figures are calculated is described at PersonReportMonth and PersonReportTotal.
  */
endpoint PersonReports GET /api/aggregations/person-report ? {from: String?,to: String?,personId: String?} -> {
  200 -> PersonReport[]
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
  paidLeaveHours: Number?,
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
  paidLeaveHours: Number?,
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
  revenueGross: Number?,
  cost: Number?
}
type NonProductiveHours {
  sickHours: Number?,
  holidayHours: Number?,
  paidParentalLeaveHours: Number?,
  unpaidParentalLeaveHours: Number?,
  paidLeaveHours: Number?
}
type AggregationLeaveDay {
  name: String?,
  contractHours: Number?,
  plusHours: Number?,
  holidayHours: Number?,
  paidParentalLeaveHours: Number?,
  unpaidParentalLeaveHours: Number?,
  paidLeaveHours: Number?
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
  holidayOnHackDayHours: Number?,
  sickOnHackDayHours: Number?,
  totalHoursRemaining: Number?
}
type AggregationHackDay {
  name: String?,
  contractHours: Number?,
  hackHoursUsed: Number?,
  holidayOnHackDayHours: Number?,
  sickOnHackDayHours: Number?,
  upcomingHackHoursUsed: Number?,
  upcomingHolidayOnHackDayHours: Number?,
  upcomingSickOnHackDayHours: Number?
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
/**
  * One person in the person report.
  *
  * months: one entry for every month in the period in which the person had a contract or registered
  *   work, sick, leave or event hours, oldest first.
  * firstMonth, lastMonth: first and last entry of months as yyyy-MM. Null when there are no months.
  * total: the figures of all months added up.
  */
type PersonReport {
  id: String,
  name: String,
  active: Boolean,
  firstMonth: String?,
  lastMonth: String?,
  total: PersonReportTotal,
  months: PersonReportMonth[]
}
/**
  * Figures of a person over the whole period.
  *
  * months: number of months the person was active in.
  * The hours, revenue and cost are the sum of the months. The margin, the average hourly rate and the
  * utilization are calculated again from those sums, they are not an average of the months.
  *
  * All hours are hours, money is in euros, and nothing is rounded except the ratios (4 decimals).
  * Work, sick and leave days with status REJECTED are left out; REQUESTED, APPROVED and DONE count.
  *
  * contractHours: for every working day (Monday to Friday) under contract: hoursPerWeek / 5.
  *   A management contract has no hours and counts as 40 hours a week. Public holidays are not known and count as working days.
  * workHours: sum of the hours registered on work days.
  * revenue: sum over the work days of hours * hourlyRate of the assignment the hours were made on.
  * cost: internal contract: monthlySalary * days under contract in the month / days in the month.
  *   Management contract: the same with monthlyFee. External contract: hours worked on a day * hourlyRate of the contract on that day.
  * margin: revenue - cost.
  * averageHourlyRate: revenue / workHours. Null without work hours.
  * sickHours: sum of the hours registered on sick days.
  * holidayHours, paidLeaveHours, paidParentalLeaveHours, unpaidParentalLeaveHours: sum of the hours on leave days of that type.
  *   Plus days are not leave and are left out.
  * leaveHours: holidayHours + paidLeaveHours + paidParentalLeaveHours + unpaidParentalLeaveHours.
  * eventHours: sum of the hours the person has on events (hack days, training, conferences and so on).
  * availableHours: contractHours - sickHours - leaveHours - eventHours, never below 0.
  * utilization: workHours / contractHours, as a fraction (0.75 is 75%). Null without contract hours.
  * utilizationAvailable: workHours / availableHours, as a fraction. Null without available hours.
  */
type PersonReportTotal {
  months: Integer32,
  contractHours: Number,
  workHours: Number,
  revenue: Number,
  cost: Number,
  margin: Number,
  averageHourlyRate: Number?,
  utilization: Number?,
  utilizationAvailable: Number?,
  availableHours: Number,
  sickHours: Number,
  leaveHours: Number,
  holidayHours: Number,
  paidLeaveHours: Number,
  paidParentalLeaveHours: Number,
  unpaidParentalLeaveHours: Number,
  eventHours: Number
}
/**
  * Figures of a person for one month. Only the days of the month that fall in the period and, for the
  * contract figures, under a contract are counted.
  *
  * yearMonth: the month as yyyy-MM.
  * contractTypes: types of the contracts the person had in the month: INTERNAL, EXTERNAL or MANAGEMENT.
  *
  * All hours are hours, money is in euros, and nothing is rounded except the ratios (4 decimals).
  * Work, sick and leave days with status REJECTED are left out; REQUESTED, APPROVED and DONE count.
  *
  * contractHours: for every working day (Monday to Friday) under contract: hoursPerWeek / 5.
  *   A management contract has no hours and counts as 40 hours a week. Public holidays are not known and count as working days.
  * workHours: sum of the hours registered on work days.
  * revenue: sum over the work days of hours * hourlyRate of the assignment the hours were made on.
  * cost: internal contract: monthlySalary * days under contract in the month / days in the month.
  *   Management contract: the same with monthlyFee. External contract: hours worked on a day * hourlyRate of the contract on that day.
  * margin: revenue - cost.
  * averageHourlyRate: revenue / workHours. Null without work hours.
  * sickHours: sum of the hours registered on sick days.
  * holidayHours, paidLeaveHours, paidParentalLeaveHours, unpaidParentalLeaveHours: sum of the hours on leave days of that type.
  *   Plus days are not leave and are left out.
  * leaveHours: holidayHours + paidLeaveHours + paidParentalLeaveHours + unpaidParentalLeaveHours.
  * eventHours: sum of the hours the person has on events (hack days, training, conferences and so on).
  * availableHours: contractHours - sickHours - leaveHours - eventHours, never below 0.
  * utilization: workHours / contractHours, as a fraction (0.75 is 75%). Null without contract hours.
  * utilizationAvailable: workHours / availableHours, as a fraction. Null without available hours.
  */
type PersonReportMonth {
  yearMonth: String,
  contractTypes: String[],
  contractHours: Number,
  workHours: Number,
  revenue: Number,
  cost: Number,
  margin: Number,
  averageHourlyRate: Number?,
  utilization: Number?,
  utilizationAvailable: Number?,
  availableHours: Number,
  sickHours: Number,
  leaveHours: Number,
  holidayHours: Number,
  paidLeaveHours: Number,
  paidParentalLeaveHours: Number,
  unpaidParentalLeaveHours: Number,
  eventHours: Number
}
