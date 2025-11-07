package community.flock.eco.workday.user.forms

class UserForm(
    val name: String?,
    val email: String,
    val authorities: Set<String> = setOf(),
)
