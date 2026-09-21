package community.flock.eco.workday.user.domain

import java.time.LocalDateTime

class UserAccountOauth(
    internalId: Long,
    userCode: String,
    created: LocalDateTime,
    val reference: String,
    val provider: UserAccountOauthProvider,
) : UserAccount(internalId, userCode, created)
