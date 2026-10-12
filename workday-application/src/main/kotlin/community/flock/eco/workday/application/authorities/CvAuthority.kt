package community.flock.eco.workday.application.authorities

import community.flock.eco.workday.core.authorities.Authority

/**
 * READ lets a person read their own CVs and WRITE write them; ADMIN reads and writes
 * the CVs of everybody, which is what sales needs to send CVs to clients.
 */
enum class CvAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
