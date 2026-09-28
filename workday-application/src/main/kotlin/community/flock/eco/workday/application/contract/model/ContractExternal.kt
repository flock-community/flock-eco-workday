package community.flock.eco.workday.application.contract.model

import community.flock.eco.workday.application.common.model.Hourly
import community.flock.eco.workday.application.person.model.Person
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
class ContractExternal(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    person: Person,
    from: LocalDate,
    to: LocalDate? = null,
    override val hourlyRate: Double,
    override val hoursPerWeek: Int,
    val billable: Boolean = true,
) : Contract(id, code, from, to, person, ContractType.EXTERNAL),
    Hourly {
    init {
        require(person != null) {
            "External contracts must have a person"
        }
    }

    override fun totalCostsInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal =
        totalDaysInPeriod(from, to, hoursPerWeek)
            .times(hourlyRate.toBigDecimal())

    override fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal = totalDaysInPeriod(from, to, hoursPerWeek)

    override fun amountPerWorkingDay(month: YearMonth): BigDecimal =
        (hourlyRate * hoursPerWeek)
            .toBigDecimal()
            .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
}
