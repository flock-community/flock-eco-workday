package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.AttributeOverride
import jakarta.persistence.AttributeOverrides
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class Client(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    val name: String,
    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "name", column = Column(name = "logo_name")),
        AttributeOverride(name = "file", column = Column(name = "logo_file")),
    )
    val logo: Document? = null,
) : AbstractCodeEntity(id, code)
