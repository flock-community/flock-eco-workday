package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.project.domain.Project
import community.flock.eco.workday.application.model.Project as ProjectEntity

fun ProjectEntity.toDomain() =
    Project(
        internalId = id,
        code = code,
        name = name,
    )
