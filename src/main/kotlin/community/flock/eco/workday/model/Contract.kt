package community.flock.eco.workday.model

import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.utils.DateUtils
import community.flock.eco.workday.utils.DateUtils.isWorkingDay
import community.flock.eco.workday.utils.NumericUtils.sum
import java.math.BigDecimal
import java.math.BigInteger
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.ManyToOne

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
abstract class Contract(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    override val from: LocalDate,
    override val to: LocalDate?,
    @ManyToOne
    open val person: Person?,
    @Enumerated(EnumType.STRING)
    open val type: ContractType,
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
