package community.flock.eco.workday.authorities

import community.flock.eco.core.authorities.Authority

enum class ExpenseAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
