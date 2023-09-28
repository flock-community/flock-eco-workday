package community.flock.eco.workday.authorities

import community.flock.eco.core.authorities.Authority

enum class LeaveDayAuthority : Authority {
    READ,
    WRITE,
    ADMIN
}
