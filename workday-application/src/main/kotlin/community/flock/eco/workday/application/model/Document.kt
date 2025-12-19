package community.flock.eco.workday.application.model

import jakarta.persistence.Embeddable
import java.util.UUID

@Embeddable
class Document(
    val name: String,
    val file: UUID,
)
