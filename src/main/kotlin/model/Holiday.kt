package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.core.model.AbstractIdEntity
import java.util.*
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Holiday(

        override val id: Long = 0,

        @Enumerated(EnumType.STRING)
        val status: HolidayStatus,

        @ManyToOne
        val period: Period

): AbstractIdEntity(id) {
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}

