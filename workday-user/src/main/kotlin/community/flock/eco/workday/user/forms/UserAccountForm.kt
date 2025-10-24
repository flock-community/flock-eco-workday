package community.flock.eco.workday.user.forms

abstract class UserAccountForm(
    open val email: String,
    open val name: String? = null,
    open val authorities: Set<String> = setOf(),
)
