package community.flock.eco.workday.application.authorities

import community.flock.eco.workday.core.authorities.Authority

enum class WorkDayAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
    TOTAL_HOURS,
}
