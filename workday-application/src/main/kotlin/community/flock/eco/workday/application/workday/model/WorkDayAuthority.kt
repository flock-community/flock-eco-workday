package community.flock.eco.workday.application.workday.model

import community.flock.eco.workday.core.authorities.Authority

enum class WorkDayAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
    TOTAL_HOURS,
}
