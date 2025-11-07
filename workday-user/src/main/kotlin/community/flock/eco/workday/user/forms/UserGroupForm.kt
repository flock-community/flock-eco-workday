package community.flock.eco.workday.user.forms

class UserGroupForm(
    val name: String? = "",
    val users: Set<String>? = setOf(),
)
