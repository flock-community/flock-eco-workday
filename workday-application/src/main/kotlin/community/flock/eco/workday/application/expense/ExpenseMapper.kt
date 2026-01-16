package community.flock.eco.workday.application.expense

import community.flock.eco.workday.api.model.CostExpenseInput
import community.flock.eco.workday.api.model.TravelExpenseInput
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.common.Status
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.TravelExpense
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.ExpenseStatus as StatusApi
import community.flock.eco.workday.application.expense.CostExpense as CostExpenseEntity
import community.flock.eco.workday.application.expense.TravelExpense as TravelExpenseEntity

@Component
class TravelExpenseMapper(
    private val personService: PersonService,
) {
    fun consume(
        input: TravelExpenseInput,
        id: UUID? = null,
    ) = TravelExpense(
        id = id ?: UUID.randomUUID(),
        date = LocalDate.parse(input.date),
        description = input.description,
        distance = input.distance.toString().toDouble(),
        allowance = input.allowance.toString().toDouble(),
        status = input.status.consumeStatus(),
        person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person"),
    )
}

@Component
class CostExpenseMapper(
    private val personService: PersonService,
) {
    fun consume(
        input: CostExpenseInput,
        id: UUID? = null,
    ) = CostExpense(
        id = id ?: UUID.randomUUID(),
        date = LocalDate.parse(input.date),
        description = input.description,
        amount = input.amount.toString().toDouble(),
        files =
            input.files
                .map {
                    Document(
                        name = it.name,
                        file = UUID.fromString(it.file.value),
                    )
                },
        status = input.status.consumeStatus(),
        person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person"),
    )
}

fun StatusApi.consumeStatus(): ApprovalStatus =
    when (this) {
        StatusApi.REQUESTED -> ApprovalStatus.REQUESTED
        StatusApi.APPROVED -> ApprovalStatus.APPROVED
        StatusApi.REJECTED -> ApprovalStatus.REJECTED
        StatusApi.DONE -> ApprovalStatus.DONE
    }

fun StatusApi.consume(): Status =
    when (this) {
        StatusApi.REQUESTED -> Status.REQUESTED
        StatusApi.APPROVED -> Status.APPROVED
        StatusApi.REJECTED -> Status.REJECTED
        StatusApi.DONE -> Status.DONE
    }

fun TravelExpense<*>.toEntity(personEntity: Person) =
    TravelExpenseEntity(
        id = id,
        date = date,
        description = description,
        person = personEntity,
        status = status.toEntity(),
        distance = distance,
        allowance = allowance,
    )

fun TravelExpenseEntity.toDomain() =
    TravelExpense(
        id = id,
        date = date,
        description = description,
        person = person.toDomain(),
        status = status.toDomain(),
        distance = distance,
        allowance = allowance,
    )

fun CostExpense<*>.toEntity(personReference: Person) =
    CostExpenseEntity(
        id = id,
        date = date,
        description = description,
        person = personReference,
        status = status.toEntity(),
        amount = amount,
        files = files.map { it.toEntity() }.toMutableList(),
    )

fun CostExpenseEntity.toDomain() =
    CostExpense(
        id = id,
        date = date,
        description = description,
        person = person.toDomain(),
        status = status.toDomain(),
        amount = amount,
        files = files.map { it.toDomain() },
    )
