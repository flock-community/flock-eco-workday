package community.flock.eco.workday.domain.todo

import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.Expense
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.leaveday.LeaveDay
import community.flock.eco.workday.domain.leaveday.LeaveDayType
import community.flock.eco.workday.domain.person.Person
import community.flock.eco.workday.domain.sickday.SickDay
import community.flock.eco.workday.domain.workday.WorkDay

/**
 * Something awaiting approval: a leave day, sick day or work day that was requested, or an expense
 * that was submitted. [code] identifies the registration it stands for, [type] says which kind.
 */
data class Todo(
    val code: String,
    val type: TodoType,
    val person: Person,
    val description: String,
)

fun LeaveDay<*>.toTodo() =
    Todo(
        code = code,
        type = type.toTodoType(),
        person = person,
        description = "$from - $to",
    )

fun SickDay<*>.toTodo() =
    Todo(
        code = code,
        type = TodoType.SICKDAY,
        person = person,
        description = "$from - $to",
    )

fun WorkDay<*>.toTodo() =
    Todo(
        code = code,
        type = TodoType.WORKDAY,
        person = assignment.person,
        description = "$from - $to",
    )

fun Expense<*>.toTodo() =
    Todo(
        code = id.toString(),
        type = TodoType.EXPENSE,
        person = person,
        description = "$description : ${amountDescription()}",
    )

private fun LeaveDayType.toTodoType() =
    when (this) {
        LeaveDayType.HOLIDAY -> TodoType.HOLIDAY
        LeaveDayType.PLUSDAY -> TodoType.PLUSDAY
        LeaveDayType.PAID_PARENTAL_LEAVE -> TodoType.PAID_PARENTAL_LEAVE
        LeaveDayType.UNPAID_PARENTAL_LEAVE -> TodoType.UNPAID_PARENTAL_LEAVE
        LeaveDayType.PAID_LEAVE -> TodoType.PAID_LEAVE
    }

private fun Expense<*>.amountDescription() =
    when (this) {
        is CostExpense -> amount.toString()
        is TravelExpense -> "$distance / $allowance"
    }
