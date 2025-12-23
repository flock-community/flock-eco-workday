package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class Project(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    val name: String,
) : AbstractCodeEntity(id, code)
