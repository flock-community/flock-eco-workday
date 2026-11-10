package community.flock.eco.workday.application.model

import java.math.BigDecimal
import java.math.RoundingMode
import java.time.YearMonth

/**
 * What a person did for Flock over a period: the figures summed over the whole period
 * and the same figures for every month the person was active in.
 */
data class PersonReport(
    val person: Person,
    val total: PersonReportFigures,
    val months: List<PersonReportMonth>,
)

data class PersonReportMonth(
    val yearMonth: YearMonth,
    val contractTypes: Set<ContractType>,
    val figures: PersonReportFigures,
) {
    operator fun plus(other: PersonReportMonth) =
        copy(
            contractTypes = contractTypes + other.contractTypes,
            figures = figures + other.figures,
        )
}

data class PersonReportFigures(
    /** Hours the person is contracted for: the contract hours on the working days under contract. */
    val contractHours: BigDecimal = BigDecimal.ZERO,
    /** Hours registered on work days for a client. */
    val workHours: BigDecimal = BigDecimal.ZERO,
    /** Work hours times the hourly rate of the assignment they were made on. */
    val revenue: BigDecimal = BigDecimal.ZERO,
    /** Salary or management fee for the days under contract, or the external hourly rate times the work hours. */
    val cost: BigDecimal = BigDecimal.ZERO,
    val sickHours: BigDecimal = BigDecimal.ZERO,
    val holidayHours: BigDecimal = BigDecimal.ZERO,
    val paidLeaveHours: BigDecimal = BigDecimal.ZERO,
    val paidParentalLeaveHours: BigDecimal = BigDecimal.ZERO,
    val unpaidParentalLeaveHours: BigDecimal = BigDecimal.ZERO,
    val eventHours: BigDecimal = BigDecimal.ZERO,
) {
    val margin: BigDecimal get() = revenue - cost

    val leaveHours: BigDecimal get() = holidayHours + paidLeaveHours + paidParentalLeaveHours + unpaidParentalLeaveHours

    val sickDays: BigDecimal get() = sickHours.toDays()

    val leaveDays: BigDecimal get() = leaveHours.toDays()

    /** Contract hours that were not taken up by sickness, leave or events. */
    val availableHours: BigDecimal get() = (contractHours - sickHours - leaveHours - eventHours).max(BigDecimal.ZERO)

    /** Share of the contract hours that was worked for a client; null without contract hours. */
    val utilization: BigDecimal? get() = workHours.ratioOf(contractHours)

    /** Share of the available hours that was worked for a client; null without available hours. */
    val utilizationAvailable: BigDecimal? get() = workHours.ratioOf(availableHours)

    /** Revenue per worked hour; null without work hours. */
    val averageHourlyRate: BigDecimal? get() = revenue.ratioOf(workHours)

    operator fun plus(other: PersonReportFigures) =
        PersonReportFigures(
            contractHours = contractHours + other.contractHours,
            workHours = workHours + other.workHours,
            revenue = revenue + other.revenue,
            cost = cost + other.cost,
            sickHours = sickHours + other.sickHours,
            holidayHours = holidayHours + other.holidayHours,
            paidLeaveHours = paidLeaveHours + other.paidLeaveHours,
            paidParentalLeaveHours = paidParentalLeaveHours + other.paidParentalLeaveHours,
            unpaidParentalLeaveHours = unpaidParentalLeaveHours + other.unpaidParentalLeaveHours,
            eventHours = eventHours + other.eventHours,
        )

    companion object {
        val HOURS_PER_DAY: BigDecimal = BigDecimal.valueOf(8)

        private fun BigDecimal.toDays() = divide(HOURS_PER_DAY, 4, RoundingMode.HALF_UP)

        private fun BigDecimal.ratioOf(other: BigDecimal) =
            other
                .takeIf { it.signum() > 0 }
                ?.let { divide(it, 4, RoundingMode.HALF_UP) }
    }
}
