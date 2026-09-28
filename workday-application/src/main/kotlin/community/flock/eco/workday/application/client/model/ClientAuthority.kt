package community.flock.eco.workday.application.client.model

import community.flock.eco.workday.core.authorities.Authority

enum class ClientAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
