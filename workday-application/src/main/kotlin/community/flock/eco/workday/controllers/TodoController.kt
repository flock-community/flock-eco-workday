package community.flock.eco.workday.controllers

import community.flock.eco.core.authorities.Authority
import community.flock.eco.workday.api.Todo
import community.flock.eco.workday.api.TodoType
import community.flock.eco.workday.api.validate
import community.flock.eco.workday.authorities.ExpenseAuthority
import community.flock.eco.workday.authorities.LeaveDayAuthority
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.LeaveDay
import community.flock.eco.workday.model.LeaveDayType
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.ExpenseService
import community.flock.eco.workday.services.LeaveDayService
import community.flock.eco.workday.services.SickDayService
import community.flock.eco.workday.services.WorkDayService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.UUID as UUIDApi

@RestController
@RequestMapping("/api/todos")
class TodoController(
    private val leaveDayService: LeaveDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val expenseService: ExpenseService,
) {
    @GetMapping
    @PreAuthorize("hasAuthority('TodoAuthority.READ')")
    fun getTodoAll(authentication: Authentication): List<Todo> =
        mapOf<Authority, List<Todo>>(
            LeaveDayAuthority.READ to findLeaveDayTodo(),
            SickdayAuthority.READ to findSickDayTodo(),
            WorkDayAuthority.READ to findWorkDayTodo(),
            ExpenseAuthority.READ to findExpenseTodo(),
        )
            .filter { authentication.hasAuthority(it.key) }
            .flatMap { it.value }
            .sortedWith(compareBy({ it.personName }, { it.todoType }))

    fun findLeaveDayTodo() =
        leaveDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    fun findSickDayTodo() =
        sickDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    fun findWorkDayTodo() =
        workDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    fun findExpenseTodo() =
        expenseService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    fun Person.fullName() = "$firstname $lastname"

    fun LeaveDay.mapTodo() =
        Todo(
            id = UUIDApi(code).also(UUIDApi::validate),
            todoType = type.produce(),
            personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
            personName = person.fullName(),
            description = "$from - $to",
        )

    private fun LeaveDayType.produce() =
        when (this) {
            LeaveDayType.HOLIDAY -> TodoType.HOLIDAY
            LeaveDayType.PLUSDAY -> TodoType.PLUSDAY
            LeaveDayType.PAID_PARENTAL_LEAVE -> TodoType.PAID_PARENTAL_LEAVE
            LeaveDayType.UNPAID_PARENTAL_LEAVE -> TodoType.UNPAID_PARENTAL_LEAVE
        }

    fun SickDay.mapTodo() =
        Todo(
            id = UUIDApi(code).also(UUIDApi::validate),
            todoType = TodoType.SICKDAY,
            personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
            personName = person.fullName(),
            description = "$from - $to",
        )

    fun WorkDay.mapTodo() =
        Todo(
            id = UUIDApi(code).also(UUIDApi::validate),
            todoType = TodoType.WORKDAY,
            personId = UUIDApi(assignment.person.uuid.toString()).also(UUIDApi::validate),
            personName = assignment.person.fullName(),
            description = "$from - $to",
        )

    fun Expense.mapTodo() =
        Todo(
            id = UUIDApi(id.toString()).also(UUIDApi::validate),
            todoType = TodoType.EXPENSE,
            personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
            personName = person.fullName(),
            description = "$description : ${getAmount()}",
        )

    fun Authentication.hasAuthority(authority: Authority) =
        this.authorities
            .map { it.authority }
            .contains(authority.toName())
}

private fun Expense.getAmount(): String =
    when (this) {
        is CostExpense -> amount.toString()
        is TravelExpense -> "$distance / $allowance"
        else -> "-"
    }
