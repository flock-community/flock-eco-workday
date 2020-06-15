package community.flock.eco.workday.mappers

import community.flock.eco.workday.graphql.CostExpenseInput
import community.flock.eco.workday.graphql.TravelExpenseInput
import community.flock.eco.workday.graphql.UUID
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
        distance = input.distance.toDouble(),
        allowance = input.allowance.toDouble(),
        status = input.status,
        person = personService
            .findByCode(input.personCode.toString())
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
        amount = input.amount.toDouble(),
        files = input.files.map {
            Document(
                name = it.name,
                file = it.file
            )
        },
        status = input.status,
        person = personService
            .findByCode(input.personCode.toString())
            ?: error("Cannot find person")
    )
}
