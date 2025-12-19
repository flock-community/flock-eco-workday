package community.flock.eco.workday.user.model

import com.fasterxml.jackson.annotation.JsonIgnore
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
class UserAccountPassword(
    id: Long = 0,
    user: User,
    @JsonIgnore
    val secret: String? = null,
    @JsonIgnore
    val resetCode: String? = null,
) : UserAccount(id, user)
