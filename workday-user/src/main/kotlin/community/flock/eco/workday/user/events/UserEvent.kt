package community.flock.eco.workday.user.events

import community.flock.eco.workday.common.Event
import community.flock.eco.workday.user.model.User

abstract class UserEvent(
    open val entity: User,
) : Event
