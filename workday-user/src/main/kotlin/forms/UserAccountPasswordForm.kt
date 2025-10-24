package community.flock.eco.feature.user.forms

data class UserAccountPasswordForm(
    override val email: String,
    override val name: String? = null,
    override val authorities: Set<String> = setOf(),
    val password: String,
) : UserAccountForm(email, name, authorities)
