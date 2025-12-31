package community.flock.eco.workday.user.events

import community.flock.eco.workday.user.model.User

data class UserCreateEvent(
    override val entity: User,
) : UserEvent(entity)
