package community.flock.eco.workday.domain.user

import java.time.LocalDateTime

sealed class UserAccount(
    val internalId: Long,
    open val userCode: String,
    open val created: LocalDateTime,
)
