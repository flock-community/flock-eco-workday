package community.flock.eco.workday.domain.todo

/** The kinds of registration that can await approval, in the order the todo list shows them. */
enum class TodoType {
    WORKDAY,
    SICKDAY,
    HOLIDAY,
    PAID_PARENTAL_LEAVE,
    UNPAID_PARENTAL_LEAVE,
    EXPENSE,
    PLUSDAY,
    PAID_LEAVE,
}
