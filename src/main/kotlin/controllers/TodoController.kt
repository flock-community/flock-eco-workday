package community.flock.eco.workday.controllers

import community.flock.eco.core.authorities.Authority
import community.flock.eco.workday.authorities.ExpenseAuthority
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.graphql.Todo
import community.flock.eco.workday.graphql.TodoType
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.HolidayType
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.ExpenseService
import community.flock.eco.workday.services.HoliDayService
import community.flock.eco.workday.services.SickDayService
import community.flock.eco.workday.services.WorkDayService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/todos")
class TodoController(
    private val holiDayService: HoliDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val expenseService: ExpenseService
) {
    @GetMapping
    @PreAuthorize("hasAuthority('TodoAuthority.READ')")
    fun getTodoAll(
        authentication: Authentication
    ) = mapOf<Authority, List<Todo>>(
        HolidayAuthority.READ to findHolidayTodo(),
        SickdayAuthority.READ to findSickDayTodo(),
        WorkDayAuthority.READ to findWorkDayTodo(),
        ExpenseAuthority.READ to findExpenseTodo()
    )
        .filter { authentication.hasAuthority(it.key) }
        .flatMap { it.value }

    fun findHolidayTodo() = holiDayService
        .findAllByStatus(Status.REQUESTED)
        .map { it.mapTodo() }

    fun findSickDayTodo() = sickDayService
        .findAllByStatus(Status.REQUESTED)
        .map { it.mapTodo() }

    fun findWorkDayTodo() = workDayService
        .findAllByStatus(Status.REQUESTED)
        .map { it.mapTodo() }

    fun findExpenseTodo() = expenseService
        .findAllByStatus(Status.REQUESTED)
        .map { it.mapTodo() }

    fun Person.fullName() = "$firstname $lastname"

    fun HoliDay.mapTodo() = Todo(
        id = UUID.fromString(code),
        type = when (type) {
            HolidayType.HOLIDAY -> TodoType.HOLIDAY
            HolidayType.PLUSDAY -> TodoType.PLUSDAY
        },
        personId = person.uuid,
        personName = person.fullName(),
        description = "$from - $to"
    )

    fun SickDay.mapTodo() = Todo(
        id = UUID.fromString(code),
        type = TodoType.SICKDAY,
        personId = person.uuid,
        personName = person.fullName(),
        description = "$from - $to"
    )

    fun WorkDay.mapTodo() = Todo(
        id = UUID.fromString(code),
        type = TodoType.WORKDAY,
        personId = assignment.person.uuid,
        personName = assignment.person.fullName(),
        description = "$from - $to"
    )

    fun Expense.mapTodo() = Todo(
        id = id,
        type = TodoType.EXPENSE,
        personId = person.uuid,
        personName = person.fullName(),
        description = "$description : ${getAmount()}"
    )

    fun Authentication.hasAuthority(authority: Authority) = this.authorities
        .map { it.authority }
        .contains(authority.toName())
}

private fun Expense.getAmount(): String = when (this) {
    is CostExpense -> amount.toString()
    is TravelExpense -> "$distance / $allowance"
    else -> "-"
}
