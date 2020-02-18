package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class ContractInternal(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val person: Person,

    override val startDate: LocalDate,
    override val endDate: LocalDate? = null,

    val monthlySalary: Double,
    val hoursPerWeek: Int

) : Contract(id, code, startDate, endDate, person, ContractType.INTERNAL) {
    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()
}
