package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Hourly
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class ContractExternal(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    override val person: Person,
    override val from: LocalDate,
    override val to: LocalDate? = null,
    override val hourlyRate: Double,
    override val hoursPerWeek: Int,
    val billable: Boolean = true,
) : Hourly, Contract(id, code, from, to, person, ContractType.EXTERNAL) {
    override fun totalCostsInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        return totalDaysInPeriod(from, to, hoursPerWeek)
            .times(hourlyRate.toBigDecimal())
    }

    override fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        return totalDaysInPeriod(from, to, hoursPerWeek)
    }

    override fun equals(other: Any?) = super.equals(other)

    override fun hashCode(): Int = super.hashCode()
}
