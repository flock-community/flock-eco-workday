package community.flock.eco.workday.application.expense

import community.flock.eco.workday.core.authorities.Authority

enum class ExpenseAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
