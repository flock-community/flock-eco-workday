package community.flock.eco.workday.authorities

import community.flock.eco.core.authorities.Authority

enum class EventAuthority : Authority {
    READ,
    SUBSCRIBE,
    WRITE,
    ADMIN,
}
