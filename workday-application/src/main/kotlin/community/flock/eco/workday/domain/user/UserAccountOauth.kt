package community.flock.eco.workday.domain.user

import java.time.LocalDateTime

class UserAccountOauth(
    internalId: Long,
    userCode: String,
    created: LocalDateTime,
    val reference: String,
    val provider: UserAccountOauthProvider,
) : UserAccount(internalId, userCode, created)
