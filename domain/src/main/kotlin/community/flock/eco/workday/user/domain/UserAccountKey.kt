package community.flock.eco.workday.user.domain

import java.time.LocalDateTime

class UserAccountKey(
    internalId: Long,
    userCode: String,
    created: LocalDateTime,
    val key: String,
    val label: String?,
) : UserAccount(internalId, userCode, created)
