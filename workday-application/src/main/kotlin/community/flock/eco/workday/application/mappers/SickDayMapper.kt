package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.domain.sickday.SickDay
import community.flock.eco.workday.application.model.SickDay as SickDayEntity

fun SickDayEntity.toDomain() =
    SickDay(
        internalId = id,
        code = code,
        from = from,
        to = to,
        hours = hours,
        days = days?.toList(),
        description = description,
        status = status.toDomain(),
        person = person.toDomain(),
    )
