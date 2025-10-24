package community.flock.eco.workday.application.authorities

import community.flock.eco.workday.core.authorities.Authority

enum class PersonAuthority : Authority {
    ADMIN,
    READ,
    WRITE,
}
