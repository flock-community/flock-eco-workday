package community.flock.eco.workday.controllers

import community.flock.eco.core.authorities.Authority
import community.flock.eco.workday.api.GetTodoAllEndpoint
import community.flock.eco.workday.api.Todo
import community.flock.eco.workday.api.TodoTodoType
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
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.UUID as UUIDApi

@RestController
@RequestMapping
class TodoController(
    private val leaveDayService: LeaveDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val expenseService: ExpenseService,
) : GetTodoAllEndpoint {
    @RequestMapping(
        GetTodoAllEndpoint.PATH,
//        method = [RequestMethod.valueOf(GetTodoAllEndpoint.METHOD)]
        method = [RequestMethod.GET],
    )
    @PreAuthorize("hasAuthority('TodoAuthority.READ')")
    suspend fun getTodoAll(authentication: Authentication): Any {
        return when (val todoAll = getTodoAll(GetTodoAllEndpoint.RequestUnit())) {
            is GetTodoAllEndpoint.Response200ApplicationJson -> todoAll.content.body
            is GetTodoAllEndpoint.Response500TextPlain -> todoAll.content.body
        }
    }

    override suspend fun getTodoAll(request: GetTodoAllEndpoint.Request<*>): GetTodoAllEndpoint.Response<*> {
        val auth = SecurityContextHolder.getContext().authentication
        return mapOf<Authority, List<Todo>>(
            LeaveDayAuthority.READ to findLeaveDayTodo(),
            SickdayAuthority.READ to findSickDayTodo(),
            WorkDayAuthority.READ to findWorkDayTodo(),
            ExpenseAuthority.READ to findExpenseTodo(),
        )
            .filter { auth.hasAuthority(it.key) }
            .flatMap { it.value }
            .sortedWith(compareBy({ it.personName }, { it.todoType }))
            .let { GetTodoAllEndpoint.Response200ApplicationJson(emptyMap(), it) }
    }

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
            LeaveDayType.HOLIDAY -> TodoTodoType.HOLIDAY
            LeaveDayType.PLUSDAY -> TodoTodoType.PLUSDAY
            LeaveDayType.PAID_PARENTAL_LEAVE -> TodoTodoType.PAID_PARENTAL_LEAVE
            LeaveDayType.UNPAID_PARENTAL_LEAVE -> TodoTodoType.UNPAID_PARENTAL_LEAVE
        }

    fun SickDay.mapTodo() =
        Todo(
            id = UUIDApi(code).also(UUIDApi::validate),
            todoType = TodoTodoType.SICKDAY,
            personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
            personName = person.fullName(),
            description = "$from - $to",
        )

    fun WorkDay.mapTodo() =
        Todo(
            id = UUIDApi(code).also(UUIDApi::validate),
            todoType = TodoTodoType.WORKDAY,
            personId = UUIDApi(assignment.person.uuid.toString()).also(UUIDApi::validate),
            personName = assignment.person.fullName(),
            description = "$from - $to",
        )

    fun Expense.mapTodo() =
        Todo(
            id = UUIDApi(id.toString()).also(UUIDApi::validate),
            todoType = TodoTodoType.EXPENSE,
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
