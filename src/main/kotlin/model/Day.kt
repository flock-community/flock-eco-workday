package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractIdEntity
import java.time.LocalDate
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class Day(

        override val id: Long = 0,

        val date: LocalDate = LocalDate.now(),
        val hours: Int

): AbstractIdEntity(id) {
        override fun equals(other: Any?) = super.equals(other)
        override fun hashCode(): Int = super.hashCode()
}


