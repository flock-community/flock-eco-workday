package community.flock.eco.workday.application.budget

import community.flock.eco.workday.api.model.BudgetAllocationFile
import community.flock.eco.workday.api.model.HackTimeAllocationInput
import community.flock.eco.workday.api.model.HackTimeDetails
import community.flock.eco.workday.api.model.StudyMoneyAllocationInput
import community.flock.eco.workday.api.model.StudyMoneyDetails
import community.flock.eco.workday.api.model.StudyTimeAllocationInput
import community.flock.eco.workday.api.model.StudyTimeDetails
import community.flock.eco.workday.api.model.validate
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.domain.budget.BudgetAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
import community.flock.eco.workday.domain.common.Document
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.BudgetAllocation as BudgetAllocationApi
import community.flock.eco.workday.api.model.BudgetAllocationType as BudgetAllocationTypeApi
import community.flock.eco.workday.api.model.DailyAllocationType as DailyAllocationTypeApi
import community.flock.eco.workday.api.model.DailyTimeAllocationItem
import community.flock.eco.workday.api.model.UUID as UUIDApi

@Component
class BudgetAllocationApiMapper(
    private val personService: PersonService,
) {
    fun consumeHackTime(
        input: HackTimeAllocationInput,
        id: Long? = null,
    ): HackTimeBudgetAllocation {
        val person = personService
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

    fun consumeStudyTime(
        input: StudyTimeAllocationInput,
        id: Long? = null,
    ): StudyTimeBudgetAllocation {
        val person = personService
            .findByUuid(UUID.fromString(input.personId.value))
            ?.toDomain()
            ?: error("Cannot find person")
        return StudyTimeBudgetAllocation(
            id = id ?: 0,
            person = person,
            eventCode = input.eventCode,
            date = LocalDate.parse(input.date),
            description = input.description,
            dailyTimeAllocations = input.dailyAllocations.map { it.consume() },
            totalHours = input.dailyAllocations.sumOf { it.hours },
        )
    }

    fun consumeStudyMoney(
        input: StudyMoneyAllocationInput,
        id: Long? = null,
    ): StudyMoneyBudgetAllocation {
        val person = personService
            .findByUuid(UUID.fromString(input.personId.value))
            ?.toDomain()
            ?: error("Cannot find person")
        return StudyMoneyBudgetAllocation(
            id = id ?: 0,
            person = person,
            eventCode = input.eventCode,
            date = LocalDate.parse(input.date),
            description = input.description,
            amount = BigDecimal(input.amount.toString()),
            files = input.files.map {
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
            type = when (type) {
                DailyAllocationTypeApi.STUDY -> BudgetAllocationType.STUDY
                DailyAllocationTypeApi.HACK -> BudgetAllocationType.HACK
            },
        )
}

// Domain-to-API produce extension functions

internal fun HackTimeBudgetAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = id.toString(),
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        type = BudgetAllocationTypeApi.HACK_TIME,
        hackTimeDetails = HackTimeDetails(
            totalHours = totalHours,
            dailyAllocations = dailyTimeAllocations.map { it.produce() },
        ),
        studyTimeDetails = null,
        studyMoneyDetails = null,
    )

internal fun StudyTimeBudgetAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = id.toString(),
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        type = BudgetAllocationTypeApi.STUDY_TIME,
        hackTimeDetails = null,
        studyTimeDetails = StudyTimeDetails(
            totalHours = totalHours,
            dailyAllocations = dailyTimeAllocations.map { it.produce() },
        ),
        studyMoneyDetails = null,
    )

internal fun StudyMoneyBudgetAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = id.toString(),
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        type = BudgetAllocationTypeApi.STUDY_MONEY,
        hackTimeDetails = null,
        studyTimeDetails = null,
        studyMoneyDetails = StudyMoneyDetails(
            amount = amount.toDouble(),
            files = files.map { it.produceBudgetFile() },
        ),
    )

internal fun DailyTimeAllocation.produce(): DailyTimeAllocationItem =
    DailyTimeAllocationItem(
        date = date.toString(),
        hours = hours,
        type = when (type) {
            BudgetAllocationType.HACK -> DailyAllocationTypeApi.HACK
            BudgetAllocationType.STUDY -> DailyAllocationTypeApi.STUDY
        },
    )

internal fun Document.produceBudgetFile(): BudgetAllocationFile =
    BudgetAllocationFile(
        name = name,
        file = UUIDApi(file.toString()).also(UUIDApi::validate),
    )
