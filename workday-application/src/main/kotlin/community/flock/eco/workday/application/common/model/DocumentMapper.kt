package community.flock.eco.workday.application.common.model

import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.application.common.model.Document as DocumentEntity

fun Document.toEntity() =
    DocumentEntity(
        name = name,
        file = file,
    )

fun DocumentEntity.toDomain() =
    Document(
        name = name,
        file = file,
    )
