package community.flock.eco.workday.user.exceptions

class UserAccountNotFoundForUserCode(userCode: String) : EcoUserException("User account for user $userCode not found")
