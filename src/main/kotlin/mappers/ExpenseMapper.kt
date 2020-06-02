package community.flock.eco.workday.mappers

import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.graphql.CostExpenseInput
import community.flock.eco.workday.graphql.TravelExpenseInput
import community.flock.eco.workday.model.Document
import org.springframework.stereotype.Component

@Component
class TravelExpenseMapper(
    private val personService: PersonService
) {
    fun consume(input: TravelExpenseInput) = TravelExpense(
        date = input.date,
        description = input.description,
        distance = input.distance.toDouble(),
        allowance = input.allowance.toDouble(),
        person = personService
            .findByCode(input.personCode.toString())
            ?: error("Cannot find person")
    )
}

@Component
class CostExpenseMapper(
    private val personService: PersonService
) {
    fun consume(input: CostExpenseInput) = CostExpense(
        date = input.date,
        description = input.description,
        amount = input.amount.toDouble(),
        files = input.files.map {
            Document(
                name = it.name,
                file = it.file
            )
        },
        person = personService
            .findByCode(input.personCode.toString())
            ?: error("Cannot find person")
    )
}
