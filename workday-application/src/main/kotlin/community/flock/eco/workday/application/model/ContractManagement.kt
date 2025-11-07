package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.core.events.EventEntityListeners
import java.math.BigDecimal
import java.math.BigInteger
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class ContractManagement(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    override val person: Person,
    override val from: LocalDate,
    override val to: LocalDate? = null,
    val monthlyFee: Double,
) : Contract(id, code, from, to, person, ContractType.MANAGEMENT) {
    override fun totalCostsInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        return totalCostInPeriod(from, to, monthlyFee)
    }

    override fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        return BigDecimal(BigInteger.ZERO)
    }

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal =
        this
            .toDateRangeInPeriod(yearMonth)
            .map { this.monthlyFee.toBigDecimal() }
            .sum()
            .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
