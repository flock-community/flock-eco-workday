package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.GetTodoAll
import community.flock.eco.workday.api.model.Todo
import community.flock.eco.workday.api.model.TodoType
import community.flock.eco.workday.api.model.UUID
import community.flock.eco.workday.api.model.validate
import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.authorities.SickdayAuthority
import community.flock.eco.workday.application.authorities.WorkDayAuthority
import community.flock.eco.workday.application.expense.ExpenseAuthority
import community.flock.eco.workday.domain.expense.ExpenseService
import community.flock.eco.workday.application.expense.toEntity
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.core.authorities.Authority
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.Expense
import community.flock.eco.workday.domain.expense.TravelExpense
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.model.UUID as UUIDApi

@RestController
class TodoController(
    private val leaveDayService: LeaveDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val expenseService: ExpenseService,
) : GetTodoAll.Handler {
    @PreAuthorize("hasAuthority('TodoAuthority.READ')")
    override suspend fun getTodoAll(request: GetTodoAll.Request): GetTodoAll.Response<*> {
        val authentication = SecurityContextHolder.getContext().authentication
        val list =
            mapOf<Authority, List<Todo>>(
                LeaveDayAuthority.READ to findLeaveDayTodo(),
                SickdayAuthority.READ to findSickDayTodo(),
                WorkDayAuthority.READ to findWorkDayTodo(),
                ExpenseAuthority.READ to findExpenseTodo(),
            ).filter { authentication.hasAuthority(it.key) }
                .flatMap { it.value }
                .sortedWith(compareBy({ it.personName }, { it.todoType }))

        return GetTodoAll.Response200(
            list.map {
                Todo(
                    id = UUID(it.id.toString()),
                    personId = UUID(it.personId.toString()),
                    personName = it.personName,
                    todoType = it.todoType,
                    description = it.description,
                )
            },
        )
    }

    private fun findLeaveDayTodo() =
        leaveDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    private fun findSickDayTodo() =
        sickDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    private fun findWorkDayTodo() =
        workDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    private fun findExpenseTodo() =
        expenseService
            .findAllByStatus(Status.REQUESTED)
            .map { it.mapTodo() }

    private fun Person.fullName() = "$firstname $lastname"

    private fun LeaveDay.mapTodo() =
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
            LeaveDayType.PAID_LEAVE -> TodoType.PAID_LEAVE
        }

    private fun SickDay.mapTodo() =
        Todo(
            id = UUIDApi(code).also(UUIDApi::validate),
            todoType = TodoType.SICKDAY,
            personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
            personName = person.fullName(),
            description = "$from - $to",
        )

    private fun WorkDay.mapTodo() =
        Todo(
            id = UUIDApi(code).also(UUIDApi::validate),
            todoType = TodoType.WORKDAY,
            personId = UUIDApi(assignment.person.uuid.toString()).also(UUIDApi::validate),
            personName = assignment.person.fullName(),
            description = "$from - $to",
        )

    private fun Expense.mapTodo() =
        toEntity()
            .run {
                Todo(
                    id = UUIDApi(id.toString()).also(UUIDApi::validate),
                    todoType = TodoType.EXPENSE,
                    personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
                    personName = person.fullName(),
                    description = "$description : ${getAmount()}",
                )
            }

    private fun Authentication.hasAuthority(authority: Authority) =
        this.authorities
            .map { it.authority }
            .contains(authority.toName())
}

private fun Expense.getAmount(): String =
    when (this) {
        is CostExpense -> amount.toString()
        is TravelExpense -> "$distance / $allowance"
    }
