package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import java.util.*
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class Client(

        override val id: Long = 0,
        override val code: String = UUID.randomUUID().toString(),

        val name:String

):AbstractCodeEntity(id, code) {
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}

