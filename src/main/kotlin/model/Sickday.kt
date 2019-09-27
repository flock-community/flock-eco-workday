package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.core.model.AbstractIdEntity
import java.util.*
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Sickday(

        override val id: Long = 0,

        @ManyToOne
        val period: Period

): AbstractIdEntity(id) {
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}

