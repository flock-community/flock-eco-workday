package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.application.model.WorkDaySheet
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.workday.WorkDay
import community.flock.eco.workday.application.model.WorkDay as WorkDayEntity

fun WorkDayEntity.toDomain() =
    WorkDay(
        internalId = id,
        code = code,
        from = from,
        to = to,
        hours = hours,
        days = days?.toList(),
        assignment = assignment.toDomain(),
        status = status.toDomain(),
        sheets = sheets.map { it.toDomain() },
    )

fun WorkDaySheet.toDomain() =
    Document(
        name = name,
        file = file,
    )
