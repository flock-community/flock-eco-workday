package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.domain.budget.BudgetAllocation
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.application.model.Person as PersonEntity
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation as HackTimeDomain
import community.flock.eco.workday.domain.budget.TrainingMoneyBudgetAllocation as TrainingMoneyDomain
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocation as TrainingTimeDomain

fun BudgetAllocationEntity.toBudgetAllocationDomain(): BudgetAllocation =
    when (this) {
        is HackTimeBudgetAllocationEntity -> toDomain()
        is TrainingTimeBudgetAllocationEntity -> toDomain()
        is TrainingMoneyBudgetAllocationEntity -> toDomain()
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

fun TrainingTimeBudgetAllocationEntity.toDomain() =
    TrainingTimeDomain(
        id = id,
        person = person!!.toDomain(),
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toDomain() },
        totalHours = totalHours,
    )

fun TrainingTimeDomain.toEntity(personReference: PersonEntity) =
    TrainingTimeBudgetAllocationEntity(
        id = id,
        person = personReference,
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toEmbeddable() }.toMutableList(),
        totalHours = totalHours,
    )

fun TrainingMoneyBudgetAllocationEntity.toDomain() =
    TrainingMoneyDomain(
        id = id,
        person = person!!.toDomain(),
        eventCode = eventCode,
        date = date,
        description = description,
        amount = amount,
        files = files.map { it.toDomain() },
    )

fun TrainingMoneyDomain.toEntity(personReference: PersonEntity) =
    TrainingMoneyBudgetAllocationEntity(
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
