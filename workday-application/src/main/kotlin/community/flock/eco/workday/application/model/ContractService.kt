package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class ContractService(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    from: LocalDate,
    to: LocalDate? = null,
    val monthlyCosts: Double,
    val description: String,
) : Contract(id, code, from, to, null, ContractType.SERVICE) {
    override fun totalCostsInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        TODO("Not yet implemented")
    }

    override fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        TODO("Not yet implemented")
    }

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal =
        this
            .toDateRangeInPeriod(yearMonth)
            .map { this.monthlyCosts.toBigDecimal() }
            .sum()
            .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
