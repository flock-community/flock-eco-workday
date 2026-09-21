package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.common.Document
import community.flock.eco.workday.application.model.Document as DocumentEntity

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
