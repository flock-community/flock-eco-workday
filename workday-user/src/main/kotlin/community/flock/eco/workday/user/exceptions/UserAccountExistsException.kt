package community.flock.eco.workday.user.exceptions

import community.flock.eco.workday.user.model.UserAccount

class UserAccountExistsException(userAccount: UserAccount) : EcoUserException(
    "User account with email '${userAccount.user.email}' and already exists",
)
