package community.flock.eco.workday.user.model

import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

@Entity
@EntityListeners(EventEntityListeners::class)
@Table(
    uniqueConstraints = [
        UniqueConstraint(
            name = "uc_user_account_oauth_provider_reference",
            columnNames = ["provider", "reference"],
        ),
    ],
)
class UserAccountOauth(
    id: Long = 0,
    user: User,
    val reference: String,
    val provider: UserAccountOauthProvider,
) : UserAccount(id, user)
