package community.flock.eco.workday.domain.user

import java.time.LocalDateTime

class UserAccountKey(
    internalId: Long,
    user: User,
    created: LocalDateTime,
    val key: String,
    val label: String?,
) : UserAccount(internalId, user, created)
