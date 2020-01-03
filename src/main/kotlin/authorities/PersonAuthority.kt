package community.flock.eco.workday.authorities

import community.flock.eco.core.authorities.Authority

enum class PersonAuthority : Authority {
    ADMIN,
    READ,
    WRITE
}
