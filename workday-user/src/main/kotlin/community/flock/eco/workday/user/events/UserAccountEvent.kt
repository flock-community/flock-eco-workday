package community.flock.eco.workday.user.events

import community.flock.eco.workday.core.events.Event
import community.flock.eco.workday.user.model.UserAccount

abstract class UserAccountEvent(
    open val entity: UserAccount,
) : Event
