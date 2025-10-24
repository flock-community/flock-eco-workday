package community.flock.eco.feature.user.events

import community.flock.eco.feature.user.model.User

data class UserUpdateEvent(override val entity: User) : UserEvent(entity)
