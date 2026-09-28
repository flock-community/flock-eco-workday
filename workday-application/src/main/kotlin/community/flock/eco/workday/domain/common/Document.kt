package community.flock.eco.workday.domain.common

import java.util.UUID

data class Document(
    val name: String,
    val file: UUID,
)
