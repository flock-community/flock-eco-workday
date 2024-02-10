package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
@EntityListeners(EventEntityListeners::class)
data class Project(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    val name: String,
) : AbstractCodeEntity(id, code) {
    override fun equals(obj: Any?) = super.equals(obj)
}
