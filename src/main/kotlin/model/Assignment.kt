package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityReference
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.feature.user.model.User
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

        val startDate: LocalDate,
        val endDate: LocalDate?,

        @ManyToOne
        @JsonIdentityReference(alwaysAsId=true)
        val client: Client,

        @ManyToOne
        @JsonIdentityReference(alwaysAsId=true)
        val user: User

) : AbstractCodeEntity(id, code) {
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}
