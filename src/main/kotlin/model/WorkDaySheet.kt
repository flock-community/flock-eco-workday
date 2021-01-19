package community.flock.eco.workday.model

import java.util.UUID
import javax.persistence.Embeddable

@Embeddable
class WorkDaySheet(
    val name: String,
    val file: UUID
)
