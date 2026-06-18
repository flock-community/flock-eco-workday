package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.TimeAllocation
import community.flock.eco.workday.application.model.Person as PersonEntity

fun TimeAllocationEntity.toDomain() =
    TimeAllocation(
        code = code,
        person = person.toDomain(),
        eventCode = eventCode,
        date = date,
        description = description,
        dailyAllocations = dailyAllocations.map { it.toDomain() },
    )

fun TimeAllocation.toEntity(
    personReference: PersonEntity,
    id: Long = 0,
) = TimeAllocationEntity(
    id = id,
    code = code,
    person = personReference,
    eventCode = eventCode,
    date = date,
    description = description,
    dailyAllocations = dailyAllocations.map { it.toEmbeddable() }.toMutableList(),
)

fun MoneyAllocationEntity.toDomain() =
    MoneyAllocation(
        code = code,
        person = person.toDomain(),
        eventCode = eventCode,
        date = date,
        description = description,
        amount = amount,
        files = files.map { it.toDomain() },
    )

fun MoneyAllocation.toEntity(
    personReference: PersonEntity,
    id: Long = 0,
) = MoneyAllocationEntity(
    id = id,
    code = code,
    person = personReference,
    eventCode = eventCode,
    date = date,
    description = description,
    amount = amount,
    files = files.map { it.toEntity() }.toMutableList(),
)

fun DailyTimeAllocationEmbeddable.toDomain() =
    DailyTimeAllocation(
        date = date,
        hours = hours,
        type = type,
    )

fun DailyTimeAllocation.toEmbeddable() =
    DailyTimeAllocationEmbeddable(
        date = date,
        hours = hours,
        type = type,
    )
