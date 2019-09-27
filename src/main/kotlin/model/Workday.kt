package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractIdEntity
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.ManyToOne
import javax.persistence.OneToOne

@Entity
@EntityListeners(EventEntityListeners::class)
data class Workday(
        override val id: Long = 0,

        @ManyToOne
        val period: Period,

        @OneToOne
        val client: Client
) : AbstractIdEntity(id) {
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}
