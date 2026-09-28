package community.flock.eco.workday.application.assignment.model

import community.flock.eco.workday.core.authorities.Authority

enum class AssignmentAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
