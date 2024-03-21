package community.flock.eco.workday.authorities

import community.flock.eco.core.authorities.Authority

enum class SickdayAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
