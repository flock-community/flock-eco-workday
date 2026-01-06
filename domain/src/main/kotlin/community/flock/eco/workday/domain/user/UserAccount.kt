package community.flock.eco.workday.domain.user

import java.time.LocalDateTime


sealed class UserAccount(
    val internalId: Long,
    open val user: User,
    open val created: LocalDateTime,
)

