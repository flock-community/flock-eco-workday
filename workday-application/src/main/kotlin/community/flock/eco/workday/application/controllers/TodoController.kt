package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.GetTodoAll
import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.authorities.SickdayAuthority
import community.flock.eco.workday.application.authorities.WorkDayAuthority
import community.flock.eco.workday.application.expense.ExpenseAuthority
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.core.authorities.Authority
import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Status
import community.flock.eco.workday.domain.expense.ExpenseService
import community.flock.eco.workday.domain.todo.Todo
import community.flock.eco.workday.domain.todo.TodoType
import community.flock.eco.workday.domain.todo.toTodo
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.model.Todo as TodoApi
import community.flock.eco.workday.api.model.TodoType as TodoTypeApi
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
        val todos =
            mapOf<Authority, () -> List<Todo>>(
                LeaveDayAuthority.READ to ::findLeaveDayTodos,
                SickdayAuthority.READ to ::findSickDayTodos,
                WorkDayAuthority.READ to ::findWorkDayTodos,
                ExpenseAuthority.READ to ::findExpenseTodos,
            ).filter { authentication.hasAuthority(it.key) }
                .flatMap { it.value() }
                .sortedWith(compareBy({ it.person.getFullName() }, { it.type }))
        return GetTodoAll.Response200(todos.map { it.produce() })
    }

    private fun findLeaveDayTodos() =
        leaveDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.toDomain().toTodo() }

    private fun findSickDayTodos() =
        sickDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.toDomain().toTodo() }

    private fun findWorkDayTodos() =
        workDayService
            .findAllByStatus(Status.REQUESTED)
            .map { it.toDomain().toTodo() }

    private fun findExpenseTodos() =
        expenseService
            .findAllByStatus<ApprovalStatus.REQUESTED>(Status.REQUESTED)
            .map { it.toTodo() }

    private fun Authentication.hasAuthority(authority: Authority) =
        this.authorities
            .map { it.authority }
            .contains(authority.toName())
}

private fun Todo.produce() =
    TodoApi(
        id = UUIDApi(code).also(UUIDApi::validate),
        todoType = type.produce(),
        personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
        personName = person.getFullName(),
        description = description,
    )

private fun TodoType.produce() =
    when (this) {
        TodoType.WORKDAY -> TodoTypeApi.WORKDAY
        TodoType.SICKDAY -> TodoTypeApi.SICKDAY
        TodoType.HOLIDAY -> TodoTypeApi.HOLIDAY
        TodoType.PAID_PARENTAL_LEAVE -> TodoTypeApi.PAID_PARENTAL_LEAVE
        TodoType.UNPAID_PARENTAL_LEAVE -> TodoTypeApi.UNPAID_PARENTAL_LEAVE
        TodoType.EXPENSE -> TodoTypeApi.EXPENSE
        TodoType.PLUSDAY -> TodoTypeApi.PLUSDAY
        TodoType.PAID_LEAVE -> TodoTypeApi.PAID_LEAVE
    }
