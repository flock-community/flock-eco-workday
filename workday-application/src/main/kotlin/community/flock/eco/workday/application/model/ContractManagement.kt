package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.math.BigDecimal
import java.math.BigInteger
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class ContractManagement(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    person: Person,
    from: LocalDate,
    to: LocalDate? = null,
    val monthlyFee: Double,
) : Contract(id, code, from, to, person, ContractType.MANAGEMENT) {
    init {
        require(person != null) {
            "External contracts must have a person"
        }
    }

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
