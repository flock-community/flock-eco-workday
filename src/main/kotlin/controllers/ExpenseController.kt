package community.flock.eco.workday.controllers


import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.ExpenseService
import community.flock.eco.workday.services.isUser
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/expenses")
class ExpenseController(
    private val expenseService: ExpenseService
) {
    @GetMapping(params = ["personCode"])
    fun getAllExpense(
        @RequestParam personCode: String,
        authentication: Authentication,
        pageable: Pageable) = expenseService
        .findAllByPersonCode(personCode, pageable)
        .toResponse()

}

@RestController
class TravelExpenseController {
}

@RestController
class CostExpenseController {
}

private fun Authentication.isAdmin(): Boolean = this.authorities
    .map { it.authority }
    .contains(WorkDayAuthority.ADMIN.toName())

private fun Expense.applyAuthentication(authentication: Authentication) = apply {
    if (!(authentication.isAdmin() || this.person.isUser(authentication.name))) {
        throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User has not access to workday: ${this.code}")
    }
}

