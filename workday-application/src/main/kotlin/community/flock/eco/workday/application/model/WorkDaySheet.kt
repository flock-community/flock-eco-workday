package community.flock.eco.workday.application.model

import jakarta.persistence.Embeddable
import java.util.UUID

@Embeddable
class WorkDaySheet(
    val name: String,
    val file: UUID,
)
