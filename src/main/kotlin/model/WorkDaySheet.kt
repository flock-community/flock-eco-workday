package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonTypeInfo
import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.ManyToOne

@Embeddable
class WorkDaySheet(
    val name: String,
    val file: UUID
)
