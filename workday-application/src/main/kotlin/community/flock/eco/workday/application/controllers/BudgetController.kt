package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.BudgetSummary
import community.flock.eco.workday.application.authorities.AggregationAuthority
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.services.BudgetSummaryService
import community.flock.eco.workday.application.services.PersonBudgetItem
import community.flock.eco.workday.application.services.PersonBudgetSummary
import community.flock.eco.workday.application.services.PersonService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.BudgetItem as BudgetItemApi
import community.flock.eco.workday.api.model.BudgetSummaryResponse as BudgetSummaryResponseApi

@RestController
class BudgetController(
    private val personService: PersonService,
    private val budgetSummaryService: BudgetSummaryService,
) : BudgetSummary.Handler {
    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    @PreAuthorize("isAuthenticated()")
    override suspend fun budgetSummary(request: BudgetSummary.Request): BudgetSummary.Response<*> {
        val auth = authentication()
        val year = request.queries.year ?: LocalDate.now().year
        val person = resolvePerson(auth, request.queries.personId)
        return BudgetSummary.Response200(
            budgetSummaryService.getSummary(person.uuid, year).produce(),
        )
    }

    private fun resolvePerson(
        auth: Authentication,
        personId: String?,
    ): Person {
        val self = personService.findByUserCode(auth.name)
        if (personId == null) {
            return self ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not linked to person")
        }
        val requested =
            try {
                UUID.fromString(personId)
            } catch (e: IllegalArgumentException) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid personId")
            }
        if (requested != self?.uuid && !auth.canQueryOthers()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to query other persons")
        }
        return personService.findByUuid(requested)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Person not found")
    }

    private fun Authentication.canQueryOthers(): Boolean =
        authorities.any { it.authority == AggregationAuthority.READ.toName() }
}

private fun PersonBudgetSummary.produce(): BudgetSummaryResponseApi =
    BudgetSummaryResponseApi(
        hackTimeBudget = hackTimeBudget.produce(),
        trainingTimeBudget = trainingTimeBudget.produce(),
        trainingMoneyBudget = trainingMoneyBudget.produce(),
    )

private fun PersonBudgetItem.produce(): BudgetItemApi =
    BudgetItemApi(
        budget = budget.toDouble(),
        used = used.toDouble(),
        available = available.toDouble(),
    )
