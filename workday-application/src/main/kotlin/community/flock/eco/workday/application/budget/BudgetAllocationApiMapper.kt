package community.flock.eco.workday.application.budget

import community.flock.eco.workday.api.model.BudgetAllocationFile
import community.flock.eco.workday.api.model.DailyTimeAllocationItem
import community.flock.eco.workday.api.model.MoneyAllocationDetails
import community.flock.eco.workday.api.model.MoneyAllocationInput
import community.flock.eco.workday.api.model.TimeAllocationDetails
import community.flock.eco.workday.api.model.TimeAllocationInput
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.domain.budget.AllocationType
import community.flock.eco.workday.domain.budget.BudgetAllocation
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.TimeAllocation
import community.flock.eco.workday.domain.common.Document
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.AllocationKind as AllocationKindApi
import community.flock.eco.workday.api.model.AllocationType as AllocationTypeApi
import community.flock.eco.workday.api.model.BudgetAllocation as BudgetAllocationApi
import community.flock.eco.workday.api.model.UUID as UUIDApi

@Component
class BudgetAllocationApiMapper(
    private val personService: PersonService,
) {
    fun consumeTime(
        input: TimeAllocationInput,
        code: String? = null,
    ): TimeAllocation {
        require(input.dailyAllocations.all { it.hours >= 0 }) { "Hours cannot be negative" }
        val person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person")
        return TimeAllocation(
            code = code ?: UUID.randomUUID().toString(),
            person = person,
            eventCode = input.eventCode,
            date = LocalDate.parse(input.date),
            description = input.description,
            dailyAllocations = input.dailyAllocations.map { it.consume() },
        )
    }

    fun consumeMoney(
        input: MoneyAllocationInput,
        code: String? = null,
    ): MoneyAllocation {
        require(input.amount >= 0) { "Amount cannot be negative" }
        val person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person")
        return MoneyAllocation(
            code = code ?: UUID.randomUUID().toString(),
            person = person,
            eventCode = input.eventCode,
            date = LocalDate.parse(input.date),
            description = input.description,
            amount = BigDecimal(input.amount.toString()),
            files =
                input.files.map {
                    Document(
                        name = it.name,
                        file = UUID.fromString(it.file.value),
                    )
                },
        )
    }

    private fun DailyTimeAllocationItem.consume(): DailyTimeAllocation =
        DailyTimeAllocation(
            date = LocalDate.parse(date),
            hours = hours,
            type =
                when (type) {
                    AllocationTypeApi.HACK -> AllocationType.HACK
                    AllocationTypeApi.TRAINING -> AllocationType.TRAINING
                },
        )
}

internal fun BudgetAllocation.produce(): BudgetAllocationApi =
    when (this) {
        is TimeAllocation -> produce()
        is MoneyAllocation -> produce()
    }

internal fun TimeAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = code,
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        kind = AllocationKindApi.TIME,
        timeDetails =
            TimeAllocationDetails(
                totalHours = totalHours,
                dailyAllocations = dailyAllocations.map { it.produce() },
            ),
        moneyDetails = null,
    )

internal fun MoneyAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = code,
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        kind = AllocationKindApi.MONEY,
        timeDetails = null,
        moneyDetails =
            MoneyAllocationDetails(
                amount = amount.toDouble(),
                files = files.map { it.produceBudgetFile() },
            ),
    )

internal fun DailyTimeAllocation.produce(): DailyTimeAllocationItem =
    DailyTimeAllocationItem(
        date = date.toString(),
        hours = hours,
        type =
            when (type) {
                AllocationType.HACK -> AllocationTypeApi.HACK
                AllocationType.TRAINING -> AllocationTypeApi.TRAINING
            },
    )

internal fun Document.produceBudgetFile(): BudgetAllocationFile =
    BudgetAllocationFile(
        name = name,
        file = UUIDApi(file.toString()).also(UUIDApi::validate),
    )
