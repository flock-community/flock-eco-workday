package community.flock.eco.workday.application.authorities

import community.flock.eco.workday.core.authorities.Authority

/**
 * READ and WRITE let a person see and maintain their own CVs; ADMIN gives access to
 * the CVs of everybody, which is what sales needs to send CVs to clients.
 */
enum class CvAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
