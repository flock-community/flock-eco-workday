package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.api.CostExpenseInput
import community.flock.eco.workday.api.TravelExpenseInput
import community.flock.eco.workday.application.model.CostExpense
import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.TravelExpense
import community.flock.eco.workday.application.services.PersonService
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.Status as StatusApi

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
            }.toMutableList(),
        status = input.status.consume(),
        person =
            personService
                .findByUuid(UUID.fromString(input.personId.value))
                ?: error("Cannot find person"),
    )
}

fun StatusApi.consume(): Status =
    when (this) {
        StatusApi.REQUESTED -> Status.REQUESTED
        StatusApi.APPROVED -> Status.APPROVED
        StatusApi.REJECTED -> Status.REJECTED
        StatusApi.DONE -> Status.DONE
    }
