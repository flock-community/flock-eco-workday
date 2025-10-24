package community.flock.eco.feature.user.events

import community.flock.eco.core.events.Event
import community.flock.eco.feature.user.model.UserAccount

abstract class UserAccountEvent(open val entity: UserAccount) : Event
