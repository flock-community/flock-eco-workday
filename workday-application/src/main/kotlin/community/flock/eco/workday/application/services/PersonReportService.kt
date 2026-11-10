package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.interfaces.inRange
import community.flock.eco.workday.application.model.Contract
import community.flock.eco.workday.application.model.ContractExternal
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.ContractManagement
import community.flock.eco.workday.application.model.Day
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.PersonReport
import community.flock.eco.workday.application.model.PersonReportFigures
import community.flock.eco.workday.application.model.PersonReportMonth
import community.flock.eco.workday.application.utils.DateUtils.isWorkingDay
import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.domain.common.Status
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth

@Service
class PersonReportService(
    private val dataService: DataService,
) {
    /**
     * Report per person over the months [from] up to and including [to]. Without [from] the
     * report starts at the first month there is anything known about the person, without [to]
     * it ends at the current month. A person only gets the months they had a contract or
     * registered hours in. Rejected work, sick and leave days are left out.
     */
    fun personReport(
        from: YearMonth? = null,
        to: YearMonth? = null,
        person: Person? = null,
    ): List<PersonReport> {
        val start = from?.atDay(1) ?: LocalDate.EPOCH
        val end = (to ?: YearMonth.now()).atEndOfMonth()
        if (end < start) return emptyList()
        val data =
            when (person) {
                null -> dataService.findAllData(start, end)
                else -> dataService.findAllData(start, end, person.uuid)
            }
        val contractsPerPerson = data.contract.groupBy { it.person }

        val contracts =
            data.contract.flatMap { contract ->
                val contractPerson = contract.person ?: return@flatMap emptyList()
                contract.monthsInPeriod(start, end).map { contractPerson to it }
            }
        val workDays =
            data.workDay
                .filter { it.status != Status.REJECTED }
                .flatMap { workDay ->
                    val workPerson = workDay.assignment.person
                    val rate = workDay.assignment.hourlyRate.toBigDecimal()
                    val externalContracts = contractsPerPerson[workPerson].orEmpty().filterIsInstance<ContractExternal>()
                    workDay
                        .hoursPerDay(start, end)
                        .entries
                        .groupBy { YearMonth.from(it.key) }
                        .map { (yearMonth, days) ->
                            val hours = days.map { it.value }.sum()
                            workPerson.month(
                                yearMonth,
                                PersonReportFigures(
                                    workHours = hours,
                                    revenue = hours.multiply(rate),
                                    cost =
                                        days
                                            .map { (date, dayHours) ->
                                                externalContracts
                                                    .filter { it.inRange(date) }
                                                    .map { it.hourlyRate.toBigDecimal().multiply(dayHours) }
                                                    .sum()
                                            }.sum(),
                                ),
                            )
                        }
                }
        val sickDays =
            data.sickDay
                .filter { it.status != Status.REJECTED }
                .flatMap { sickDay ->
                    sickDay.hoursPerMonth(start, end).map { (yearMonth, hours) ->
                        sickDay.person.month(yearMonth, PersonReportFigures(sickHours = hours))
                    }
                }
        val leaveDays =
            data.leaveDay
                .filter { it.status != Status.REJECTED }
                .flatMap { leaveDay ->
                    leaveDay.hoursPerMonth(start, end).mapNotNull { (yearMonth, hours) ->
                        when (leaveDay.type) {
                            LeaveDayType.HOLIDAY -> PersonReportFigures(holidayHours = hours)
                            LeaveDayType.PAID_LEAVE -> PersonReportFigures(paidLeaveHours = hours)
                            LeaveDayType.PAID_PARENTAL_LEAVE -> PersonReportFigures(paidParentalLeaveHours = hours)
                            LeaveDayType.UNPAID_PARENTAL_LEAVE -> PersonReportFigures(unpaidParentalLeaveHours = hours)
                            // Plus days add to the leave balance, they are not time off
                            LeaveDayType.PLUSDAY -> null
                        }?.let { leaveDay.person.month(yearMonth, it) }
                    }
                }
        val eventDays =
            data.eventDay.flatMap { eventDay ->
                eventDay.hoursPerMonth(start, end).map { (yearMonth, hours) ->
                    eventDay.person.month(yearMonth, PersonReportFigures(eventHours = hours))
                }
            }

        return (contracts + workDays + sickDays + leaveDays + eventDays)
            .groupBy({ it.first }, { it.second })
            .map { (reportPerson, contributions) ->
                val months =
                    contributions
                        .groupBy { it.yearMonth }
                        .map { (_, sameMonth) -> sameMonth.reduce(PersonReportMonth::plus) }
                        .sortedBy { it.yearMonth }
                PersonReport(
                    person = reportPerson,
                    total = months.map { it.figures }.fold(PersonReportFigures(), PersonReportFigures::plus),
                    months = months,
                )
            }.sortedWith(compareBy({ it.person.lastname }, { it.person.firstname }))
    }
}

private fun Person.month(
    yearMonth: YearMonth,
    figures: PersonReportFigures,
) = this to PersonReportMonth(yearMonth, emptySet(), figures)

private fun Day.hoursPerDay(
    start: LocalDate,
    end: LocalDate,
): Map<LocalDate, BigDecimal> {
    val first = maxOf(from, start)
    val last = minOf(to, end)
    return if (last < first) emptyMap() else hoursPerDayInPeriod(first, last)
}

private fun Day.hoursPerMonth(
    start: LocalDate,
    end: LocalDate,
): Map<YearMonth, BigDecimal> =
    hoursPerDay(start, end)
        .entries
        .groupBy({ YearMonth.from(it.key) }, { it.value })
        .mapValues { (_, hours) -> hours.sum() }

// Management contracts have no contract hours, they are counted as a 40 hour week
private const val MANAGEMENT_HOURS_PER_WEEK = 40

/**
 * Contract hours and fixed cost of this contract for every month it overlaps with the period.
 * The cost of an external contract depends on the hours worked, so it is not part of this.
 */
private fun Contract.monthsInPeriod(
    start: LocalDate,
    end: LocalDate,
): List<PersonReportMonth> {
    val first = maxOf(from, start)
    val last = minOf(to ?: end, end)
    if (last < first) return emptyList()
    val hoursPerDay =
        when (this) {
            is ContractInternal -> hoursPerWeek
            is ContractExternal -> hoursPerWeek
            is ContractManagement -> MANAGEMENT_HOURS_PER_WEEK
            else -> 0
        }.toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
    val monthlyCost =
        when (this) {
            is ContractInternal -> monthlySalary
            is ContractManagement -> monthlyFee
            else -> 0.0
        }.toBigDecimal()
    return generateSequence(YearMonth.from(first)) { it.plusMonths(1) }
        .takeWhile { it <= YearMonth.from(last) }
        .map { yearMonth ->
            val firstDay = maxOf(first, yearMonth.atDay(1))
            val lastDay = minOf(last, yearMonth.atEndOfMonth())
            val days = firstDay.datesUntil(lastDay.plusDays(1)).toList()
            PersonReportMonth(
                yearMonth = yearMonth,
                contractTypes = setOf(type),
                figures =
                    PersonReportFigures(
                        contractHours = hoursPerDay.multiply(days.count { it.isWorkingDay() }.toBigDecimal()),
                        cost =
                            monthlyCost
                                .multiply(days.size.toBigDecimal())
                                .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP),
                    ),
            )
        }.toList()
}
