package community.flock.eco.workday.application.workday.model

import com.fasterxml.jackson.annotation.JsonTypeInfo
import community.flock.eco.workday.application.assignment.model.Assignment
import community.flock.eco.workday.application.common.model.Day
import community.flock.eco.workday.application.common.model.Period
import community.flock.eco.workday.application.common.util.DateUtils.toPeriod
import community.flock.eco.workday.application.common.util.NumericUtils.calculateRevenue
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.domain.common.Approve
import community.flock.eco.workday.domain.common.Status
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.ManyToOne
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
class WorkDay(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    from: LocalDate = LocalDate.now(),
    to: LocalDate = LocalDate.now(),
    hours: Double,
    days: MutableList<Double>? = null,
    @ManyToOne
    val assignment: Assignment,
    @Enumerated(EnumType.STRING)
    override val status: Status,
    @ElementCollection(fetch = FetchType.EAGER)
    val sheets: List<WorkDaySheet>,
) : Day(id, code, from, to, hours, days),
    Approve {
    fun totalRevenueInPeriod(period: Period): BigDecimal =
        this
            .hoursPerDayInPeriod(period.from, period.to!!)
            .calculateRevenue(this.assignment.hourlyRate)

    fun totalRevenueInPeriod(yearMonth: YearMonth): BigDecimal =
        this
            .totalRevenueInPeriod(yearMonth.toPeriod())

    override fun amountPerWorkingDay(month: YearMonth): BigDecimal =
        (assignment.hourlyRate * assignment.hoursPerWeek)
            .toBigDecimal()
            .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
}
