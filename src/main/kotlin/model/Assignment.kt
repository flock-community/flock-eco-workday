package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.feature.user.model.User
import java.time.LocalDate
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.ManyToOne

@Entity
@EntityListeners(EventEntityListeners::class)
data class Assignment(

        override val id: Long,
        override val code: String,

        val startDate: LocalDate,
        val endDate: LocalDate,

        @ManyToOne
        val client: Client,

        @ManyToOne
        val user: User

) : AbstractCodeEntity(id, code) {
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}
