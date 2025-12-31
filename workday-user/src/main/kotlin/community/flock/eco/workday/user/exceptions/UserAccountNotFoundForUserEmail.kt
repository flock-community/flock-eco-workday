package community.flock.eco.workday.user.exceptions

class UserAccountNotFoundForUserEmail(
    userEmail: String,
) : EcoUserException("User account for user $userEmail not found")
