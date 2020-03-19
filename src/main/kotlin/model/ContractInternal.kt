package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Monthly
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

    override val from: LocalDate,
    override val to: LocalDate? = null,

    override val monthlySalary: Double,
    override val hoursPerWeek: Int

) : Monthly, Contract(id, code, from, to, person, ContractType.INTERNAL) {
    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()
}
