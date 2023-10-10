package community.flock.eco.workday.mappers

import community.flock.eco.workday.graphql.kotlin.CostExpenseInput
import community.flock.eco.workday.graphql.kotlin.TravelExpenseInput
import community.flock.eco.workday.graphql.kotlin.UUID
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Document
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.services.PersonService
import org.springframework.stereotype.Component

@Component
class TravelExpenseMapper(
    private val personService: PersonService
) {
    fun consume(input: TravelExpenseInput, id: UUID? = null) = TravelExpense(
        id = id ?: UUID.randomUUID(),
        date = input.date,
        description = input.description,
        distance = input.distance.toString().toDouble(),
        allowance = input.allowance.toString().toDouble(),
        status = input.status,
        person = personService
            .findByUuid(input.personId)
            ?: error("Cannot find person")
    )
}

@Component
class CostExpenseMapper(
    private val personService: PersonService
) {
    fun consume(input: CostExpenseInput, id: UUID? = null) = CostExpense(
        id = id ?: UUID.randomUUID(),
        date = input.date,
        description = input.description,
        amount = input.amount.toString().toDouble(),
        files = input.files.map {
            Document(
                name = it.name,
                file = it.file
            )
        },
        status = input.status,
        person = personService
            .findByUuid(input.personId)
            ?: error("Cannot find person")
    )
}
