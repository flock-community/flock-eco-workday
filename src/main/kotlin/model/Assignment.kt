package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.ManyToOne

@Entity
@EntityListeners(EventEntityListeners::class)
data class Assignment(

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    val role: String? = null,

    val startDate: LocalDate,
    val endDate: LocalDate?,

    val hourlyRate: Double,
    val hoursPerWeek: Int,

    @ManyToOne
    val client: Client,

    @ManyToOne
    val person: Person

) : AbstractCodeEntity(id, code) {
    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()
}
