package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.domain.budget.BudgetAllocation
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.application.model.Person as PersonEntity
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation as HackTimeDomain
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation as StudyMoneyDomain
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation as StudyTimeDomain

fun BudgetAllocationEntity.toBudgetAllocationDomain(): BudgetAllocation =
    when (this) {
        is HackTimeBudgetAllocationEntity -> toDomain()
        is StudyTimeBudgetAllocationEntity -> toDomain()
        is StudyMoneyBudgetAllocationEntity -> toDomain()
        else -> error("Unsupported budget allocation type")
    }

fun HackTimeBudgetAllocationEntity.toDomain() =
    HackTimeDomain(
        id = id,
        person = person!!.toDomain(),
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toDomain() },
        totalHours = totalHours,
    )

fun HackTimeDomain.toEntity(personReference: PersonEntity) =
    HackTimeBudgetAllocationEntity(
        id = id,
        person = personReference,
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toEmbeddable() }.toMutableList(),
        totalHours = totalHours,
    )

fun StudyTimeBudgetAllocationEntity.toDomain() =
    StudyTimeDomain(
        id = id,
        person = person!!.toDomain(),
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toDomain() },
        totalHours = totalHours,
    )

fun StudyTimeDomain.toEntity(personReference: PersonEntity) =
    StudyTimeBudgetAllocationEntity(
        id = id,
        person = personReference,
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toEmbeddable() }.toMutableList(),
        totalHours = totalHours,
    )

fun StudyMoneyBudgetAllocationEntity.toDomain() =
    StudyMoneyDomain(
        id = id,
        person = person!!.toDomain(),
        eventCode = eventCode,
        date = date,
        description = description,
        amount = amount,
        files = files.map { it.toDomain() },
    )

fun StudyMoneyDomain.toEntity(personReference: PersonEntity) =
    StudyMoneyBudgetAllocationEntity(
        id = id,
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
