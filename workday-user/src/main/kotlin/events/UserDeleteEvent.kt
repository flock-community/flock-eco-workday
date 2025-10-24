package community.flock.eco.feature.user.events

import community.flock.eco.feature.user.model.User

data class UserDeleteEvent(override val entity: User) : UserEvent(entity)
