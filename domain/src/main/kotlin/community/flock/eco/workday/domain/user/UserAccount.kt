package community.flock.eco.workday.domain.user

import java.time.LocalDateTime

// TODO: to sealed interface instead
sealed class UserAccount(
    val internalId: Long,
    val userCode: String,
    val created: LocalDateTime,
)
