package community.flock.eco.workday.user.events

import community.flock.eco.workday.user.model.UserAccountPassword

class UserAccountNewPasswordEvent(override val entity: UserAccountPassword) : UserAccountEvent(entity)
