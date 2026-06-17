package community.flock.eco.workday.application.budget

import community.flock.eco.workday.api.model.BudgetAllocationFile
import community.flock.eco.workday.api.model.DailyTimeAllocationItem
import community.flock.eco.workday.api.model.HackTimeAllocationInput
import community.flock.eco.workday.api.model.HackTimeDetails
import community.flock.eco.workday.api.model.TrainingMoneyAllocationInput
import community.flock.eco.workday.api.model.TrainingMoneyDetails
import community.flock.eco.workday.api.model.TrainingTimeAllocationInput
import community.flock.eco.workday.api.model.TrainingTimeDetails
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.domain.budget.BudgetAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.TrainingMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocation
import community.flock.eco.workday.domain.common.Document
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.BudgetAllocation as BudgetAllocationApi
import community.flock.eco.workday.api.model.BudgetAllocationType as BudgetAllocationTypeApi
import community.flock.eco.workday.api.model.DailyAllocationType as DailyAllocationTypeApi
import community.flock.eco.workday.api.model.UUID as UUIDApi

@Component
class BudgetAllocationApiMapper(
    private val personService: PersonService,
) {
    fun consumeHackTime(
        input: HackTimeAllocationInput,
        id: Long? = null,
    ): HackTimeBudgetAllocation {
        require(input.dailyAllocations.all { it.hours >= 0 }) { "Hours cannot be negative" }
        val person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person")
        return HackTimeBudgetAllocation(
            id = id ?: 0,
            person = person,
            eventCode = input.eventCode,
            date = LocalDate.parse(input.date),
            description = input.description,
            dailyTimeAllocations = input.dailyAllocations.map { it.consume() },
            totalHours = input.dailyAllocations.sumOf { it.hours },
        )
    }

    fun consumeTrainingTime(
        input: TrainingTimeAllocationInput,
        id: Long? = null,
    ): TrainingTimeBudgetAllocation {
        require(input.dailyAllocations.all { it.hours >= 0 }) { "Hours cannot be negative" }
        val person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person")
        return TrainingTimeBudgetAllocation(
            id = id ?: 0,
            person = person,
            eventCode = input.eventCode,
            date = LocalDate.parse(input.date),
            description = input.description,
            dailyTimeAllocations = input.dailyAllocations.map { it.consume() },
            totalHours = input.dailyAllocations.sumOf { it.hours },
        )
    }

    fun consumeTrainingMoney(
        input: TrainingMoneyAllocationInput,
        id: Long? = null,
    ): TrainingMoneyBudgetAllocation {
        require(input.amount >= 0) { "Amount cannot be negative" }
        val person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person")
        return TrainingMoneyBudgetAllocation(
            id = id ?: 0,
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
                    DailyAllocationTypeApi.TRAINING -> BudgetAllocationType.TRAINING
                    DailyAllocationTypeApi.HACK -> BudgetAllocationType.HACK
                },
        )
}

internal fun HackTimeBudgetAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = id.toString(),
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        type = BudgetAllocationTypeApi.HACK_TIME,
        hackTimeDetails =
            HackTimeDetails(
                totalHours = totalHours,
                dailyAllocations = dailyTimeAllocations.map { it.produce() },
            ),
        trainingTimeDetails = null,
        trainingMoneyDetails = null,
    )

internal fun TrainingTimeBudgetAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = id.toString(),
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        type = BudgetAllocationTypeApi.TRAINING_TIME,
        hackTimeDetails = null,
        trainingTimeDetails =
            TrainingTimeDetails(
                totalHours = totalHours,
                dailyAllocations = dailyTimeAllocations.map { it.produce() },
            ),
        trainingMoneyDetails = null,
    )

internal fun TrainingMoneyBudgetAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = id.toString(),
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        type = BudgetAllocationTypeApi.TRAINING_MONEY,
        hackTimeDetails = null,
        trainingTimeDetails = null,
        trainingMoneyDetails =
            TrainingMoneyDetails(
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
                BudgetAllocationType.HACK -> DailyAllocationTypeApi.HACK
                BudgetAllocationType.TRAINING -> DailyAllocationTypeApi.TRAINING
            },
    )

internal fun Document.produceBudgetFile(): BudgetAllocationFile =
    BudgetAllocationFile(
        name = name,
        file = UUIDApi(file.toString()).also(UUIDApi::validate),
    )
