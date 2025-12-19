package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.interfaces.Period
import community.flock.eco.workday.application.utils.DateUtils
import community.flock.eco.workday.application.utils.DateUtils.isWorkingDay
import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.ManyToOne
import jakarta.persistence.MappedSuperclass
import java.math.BigDecimal
import java.math.BigInteger
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
abstract class Contract(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    override val from: LocalDate,
    override val to: LocalDate?,
    @ManyToOne(fetch = FetchType.EAGER)
    val person: Person?,
    @Enumerated(EnumType.STRING)
    val type: ContractType,
) : Period, AbstractCodeEntity(id, code) {
    abstract fun totalCostsInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal

    abstract fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal

    fun totalCostInPeriod(
        from: LocalDate,
        to: LocalDate,
        salary: Double,
    ): BigDecimal {
        var monthLengthSum = 0
        val dateRangeContract =
            DateUtils.dateRange(
                this.from,
                this.to
                    ?: LocalDate.of(to.year, to.month, to.month.length(to.isLeapYear)),
            )
        val unionDateRange =
            DateUtils.dateRange(from, to)
                .intersect(dateRangeContract.toSet())
        val yearMonthsInRange = unionDateRange.map { YearMonth.of(it.year, it.month) }.distinct()
        val daysInMonth =
            yearMonthsInRange.sumOf { yearMonth ->
                monthLengthSum += yearMonth.lengthOfMonth()
                unionDateRange
                    .count { it.year == yearMonth.year && it.month == yearMonth.month }
                    .toBigDecimal()
            }
        return if (daysInMonth.toDouble() == 0.0) {
            BigDecimal(BigInteger.ZERO)
        } else {
            daysInMonth
                .times(yearMonthsInRange.count().toBigDecimal())
                .times(salary.toBigDecimal())
                .divide(monthLengthSum.toBigDecimal(), 10, RoundingMode.HALF_UP)
        }
    }

    fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
        hoursPerWeek: Int,
    ): BigDecimal {
        val dateRange = DateUtils.dateRange(from, to)
        val dateRangeContract =
            DateUtils.dateRange(
                this.from,
                this.to
                    ?: LocalDate.of(to.year, to.month, to.month.length(to.isLeapYear)),
            )
        val hoursPerDay = hoursPerWeek.toBigDecimal().divide(BigDecimal("5.0"), 10, RoundingMode.HALF_UP)
        return dateRange.intersect(dateRangeContract.toSet()).map {
            when (it.isWorkingDay()) {
                true -> hoursPerDay
                false -> BigDecimal("0.0")
            }
        }.sum()
    }
}

fun Iterable<Contract>.sumHoursWithinAPeriod(
    from: LocalDate,
    to: LocalDate,
) = this
    .map { it.totalDaysInPeriod(from, to) }
    .sum()
    .toInt()
