package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.leaveday.domain.LeaveDay
import community.flock.eco.workday.leaveday.domain.LeaveDayType
import community.flock.eco.workday.application.model.LeaveDay as LeaveDayEntity
import community.flock.eco.workday.application.model.LeaveDayType as LeaveDayTypeEntity

fun LeaveDayEntity.toDomain() =
    LeaveDay(
        internalId = id,
        code = code,
        from = from,
        to = to,
        hours = hours,
        days = days?.toList(),
        description = description,
        type = type.toDomain(),
        status = status.toDomain(),
        person = person.toDomain(),
    )

fun LeaveDayTypeEntity.toDomain(): LeaveDayType =
    when (this) {
        LeaveDayTypeEntity.HOLIDAY -> LeaveDayType.HOLIDAY
        LeaveDayTypeEntity.PLUSDAY -> LeaveDayType.PLUSDAY
        LeaveDayTypeEntity.PAID_PARENTAL_LEAVE -> LeaveDayType.PAID_PARENTAL_LEAVE
        LeaveDayTypeEntity.UNPAID_PARENTAL_LEAVE -> LeaveDayType.UNPAID_PARENTAL_LEAVE
        LeaveDayTypeEntity.PAID_LEAVE -> LeaveDayType.PAID_LEAVE
    }
