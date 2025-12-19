package community.flock.eco.workday.application.authorities

import community.flock.eco.workday.core.authorities.Authority

enum class ClientAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
