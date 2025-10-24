package community.flock.eco.feature.user.events

import community.flock.eco.core.events.Event
import community.flock.eco.feature.user.model.User

abstract class UserEvent(open val entity: User) : Event
