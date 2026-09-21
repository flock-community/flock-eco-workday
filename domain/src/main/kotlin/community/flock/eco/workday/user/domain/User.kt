package community.flock.eco.workday.user.domain

import java.time.LocalDateTime

data class User(
    val internalId: Long,
    val code: String,
    val name: String?,
    val email: String,
    val enabled: Boolean,
    val authorities: Set<String>,
    val accounts: Set<UserAccount>,
    val created: LocalDateTime,
)
