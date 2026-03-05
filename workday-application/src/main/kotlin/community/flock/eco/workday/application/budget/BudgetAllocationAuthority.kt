package community.flock.eco.workday.application.budget

import community.flock.eco.workday.core.authorities.Authority

enum class BudgetAllocationAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
