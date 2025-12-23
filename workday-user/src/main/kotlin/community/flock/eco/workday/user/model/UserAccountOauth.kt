package community.flock.eco.workday.user.model

import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
class UserAccountOauth(
    id: Long = 0,
    user: User,
    val reference: String,
    val provider: UserAccountOauthProvider,
) : UserAccount(id, user)
