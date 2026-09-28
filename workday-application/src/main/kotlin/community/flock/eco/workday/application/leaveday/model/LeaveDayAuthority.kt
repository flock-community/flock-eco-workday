package community.flock.eco.workday.application.leaveday.model

import community.flock.eco.workday.core.authorities.Authority

enum class LeaveDayAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
