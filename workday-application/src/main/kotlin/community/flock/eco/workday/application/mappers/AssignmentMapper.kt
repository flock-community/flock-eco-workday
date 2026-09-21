package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.assignment.domain.Assignment
import community.flock.eco.workday.application.model.Assignment as AssignmentEntity

fun AssignmentEntity.toDomain() =
    Assignment(
        internalId = id,
        code = code,
        role = role,
        from = from,
        to = to,
        hourlyRate = hourlyRate,
        hoursPerWeek = hoursPerWeek,
        client = client.toDomain(),
        person = person.toDomain(),
        project = project?.toDomain(),
    )
