package community.flock.eco.workday.application.laptop.model

import community.flock.eco.workday.core.authorities.Authority

enum class LaptopAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
