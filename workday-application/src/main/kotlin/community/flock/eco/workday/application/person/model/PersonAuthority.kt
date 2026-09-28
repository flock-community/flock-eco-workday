package community.flock.eco.workday.application.person.model

import community.flock.eco.workday.core.authorities.Authority

enum class PersonAuthority : Authority {
    ADMIN,
    READ,
    WRITE,
}
