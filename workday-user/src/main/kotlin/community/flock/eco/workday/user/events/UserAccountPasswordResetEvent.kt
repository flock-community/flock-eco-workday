package community.flock.eco.workday.user.events

import community.flock.eco.workday.user.model.UserAccountPassword

class UserAccountPasswordResetEvent(
    override val entity: UserAccountPassword,
) : UserAccountEvent(entity)
