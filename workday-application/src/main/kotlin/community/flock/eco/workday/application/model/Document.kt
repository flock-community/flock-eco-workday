package community.flock.eco.workday.application.model

import java.util.UUID
import javax.persistence.Embeddable

@Embeddable
class Document(
    val name: String,
    val file: UUID,
)
