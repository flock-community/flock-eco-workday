package community.flock.eco.workday.domain.user

import java.time.LocalDateTime

class UserAccountPassword(
    internalId: Long,
    userCode: String,
    created: LocalDateTime,
    val secret: String? = null, // NOTE: do not expose secret in controllers!
    val resetCode: String? = null, // NOTE: do not expose resetCode in controllers!
) : UserAccount(internalId, userCode, created)
