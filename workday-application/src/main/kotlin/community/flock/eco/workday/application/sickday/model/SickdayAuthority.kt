package community.flock.eco.workday.application.sickday.model

import community.flock.eco.workday.core.authorities.Authority

enum class SickdayAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
