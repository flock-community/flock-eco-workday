package community.flock.eco.workday.user.domain

import java.time.LocalDateTime

// TODO: to sealed interface instead
sealed class UserAccount(
    val internalId: Long,
    val userCode: String,
    val created: LocalDateTime,
)
