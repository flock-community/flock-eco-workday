package community.flock.eco.workday.authorities

import community.flock.eco.core.authorities.Authority

enum class WorkDayAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
    TOTAL_HOURS
}
