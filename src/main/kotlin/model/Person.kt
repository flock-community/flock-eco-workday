package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class Person(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    val firstname: String,
    val lastname: String,
    val email: String?
) : AbstractCodeEntity(id, code) {
    override fun equals(obj: Any?): Boolean = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()
    }
