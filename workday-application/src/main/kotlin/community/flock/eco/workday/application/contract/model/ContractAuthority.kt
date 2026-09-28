package community.flock.eco.workday.application.contract.model

import community.flock.eco.workday.core.authorities.Authority

enum class ContractAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
