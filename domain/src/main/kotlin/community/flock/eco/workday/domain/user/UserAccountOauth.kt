package community.flock.eco.workday.domain.user

import java.time.LocalDateTime



class UserAccountOauth(
    internalId: Long,
    user: User,
    created: LocalDateTime,
    val reference: String,
    val provider: UserAccountOauthProvider,
) : UserAccount(internalId, user, created)

