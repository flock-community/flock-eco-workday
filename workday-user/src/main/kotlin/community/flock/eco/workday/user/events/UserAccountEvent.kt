package community.flock.eco.workday.user.events

import community.flock.eco.workday.common.Event
import community.flock.eco.workday.user.model.UserAccount

abstract class UserAccountEvent(
    open val entity: UserAccount,
) : Event
