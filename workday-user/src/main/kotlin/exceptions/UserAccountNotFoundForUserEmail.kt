package community.flock.eco.feature.user.exceptions

class UserAccountNotFoundForUserEmail(userEmail: String) : EcoUserException("User account for user $userEmail not found")
