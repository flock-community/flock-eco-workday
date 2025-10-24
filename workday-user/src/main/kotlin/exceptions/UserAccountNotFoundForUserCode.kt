package community.flock.eco.feature.user.exceptions

class UserAccountNotFoundForUserCode(userCode: String) : EcoUserException("User account for user $userCode not found")
