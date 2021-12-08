package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.toDateRangeInPeriod
import community.flock.eco.workday.utils.NumericUtils.sum
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class ContractService(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val from: LocalDate,
    override val to: LocalDate? = null,

    val monthlyCosts: Double,
    val description: String
) : Contract(id, code, from, to, null, ContractType.SERVICE) {
    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal = this
        .toDateRangeInPeriod(yearMonth)
        .map { this.monthlyCosts.toBigDecimal() }
        .sum()
        .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
