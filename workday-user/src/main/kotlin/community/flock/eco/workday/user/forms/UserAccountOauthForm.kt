package community.flock.eco.workday.user.forms

import community.flock.eco.workday.user.model.UserAccountOauthProvider

data class UserAccountOauthForm(
    override val email: String,
    override val name: String?,
    override val authorities: Set<String> = setOf(),
    val reference: String,
    val provider: UserAccountOauthProvider,
) : UserAccountForm(email, name, authorities)
