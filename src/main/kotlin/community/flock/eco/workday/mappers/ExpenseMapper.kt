package community.flock.eco.workday.mappers

import community.flock.eco.workday.api.CostExpenseInput
import community.flock.eco.workday.api.CostExpenseInputStatus
import community.flock.eco.workday.api.TravelExpenseInput
import community.flock.eco.workday.api.TravelExpenseInputStatus
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Document
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.services.PersonService
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

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
        status = input.status.consume(),
        person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
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
            input.files.map {
                Document(
                    name = it.name,
                    file = UUID.fromString(it.file.value),
                )
            },
        status = input.status.consume(),
        person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?: error("Cannot find person"),
    )
}

fun TravelExpenseInputStatus.consume(): Status =
    when (this) {
        TravelExpenseInputStatus.REQUESTED -> Status.REQUESTED
        TravelExpenseInputStatus.APPROVED -> Status.APPROVED
        TravelExpenseInputStatus.REJECTED -> Status.REJECTED
        TravelExpenseInputStatus.DONE -> Status.DONE
    }

fun CostExpenseInputStatus.consume(): Status =
    when (this) {
        CostExpenseInputStatus.REQUESTED -> Status.REQUESTED
        CostExpenseInputStatus.APPROVED -> Status.APPROVED
        CostExpenseInputStatus.REJECTED -> Status.REJECTED
        CostExpenseInputStatus.DONE -> Status.DONE
    }
