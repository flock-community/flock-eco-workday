package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.interfaces.Hourly
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class ContractExternal(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    person: Person,
    from: LocalDate,
    to: LocalDate? = null,
    override val hourlyRate: Double,
    override val hoursPerWeek: Int,
    val billable: Boolean = true,
) : Hourly, Contract(id, code, from, to, person, ContractType.EXTERNAL) {

    init {
        require(person != null) {
            "External contracts must have a person"
        }
    }

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
}
