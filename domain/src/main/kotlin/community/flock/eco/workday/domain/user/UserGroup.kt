package community.flock.eco.workday.domain.user

import java.time.LocalDateTime

data class UserGroup(
    val internalId: Long,
    val code: String,
    val name: String,
    val users: MutableSet<User>,
    val created: LocalDateTime,
)
