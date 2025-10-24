package community.flock.eco.feature.user.exceptions

import community.flock.eco.feature.user.model.UserAccount

class UserAccountExistsException(userAccount: UserAccount) : EcoUserException(
    "User account with email '${userAccount.user.email}' and already exists",
)
