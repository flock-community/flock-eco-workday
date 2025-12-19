package community.flock.eco.workday.application.model

import com.fasterxml.jackson.annotation.JsonTypeInfo
import community.flock.eco.workday.application.interfaces.Approve
import community.flock.eco.workday.application.interfaces.Period
import community.flock.eco.workday.application.utils.DateUtils.toPeriod
import community.flock.eco.workday.application.utils.NumericUtils.calculateRevenue
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.ManyToOne
import java.math.BigDecimal
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
    days: List<Double>? = null,
    @ManyToOne
    val assignment: Assignment,
    @Enumerated(EnumType.STRING)
    override val status: Status,
    @ElementCollection
    val sheets: List<WorkDaySheet>,
) : Day(id, code, from, to, hours, days), Approve {
    fun totalRevenueInPeriod(period: Period): BigDecimal =
        this
            .hoursPerDayInPeriod(period.from, period.to!!)
            .calculateRevenue(this.assignment.hourlyRate)

    fun totalRevenueInPeriod(yearMonth: YearMonth): BigDecimal =
        this
            .totalRevenueInPeriod(yearMonth.toPeriod())
}
