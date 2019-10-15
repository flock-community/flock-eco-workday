package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.forms.UserAccountForm
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.feature.user.services.UserService
import org.springframework.stereotype.Component

@Component
class LoadUserData(
        private val userAccountService: UserAccountService,
        private val userAuthorityService: UserAuthorityService
) {
    val data: MutableSet<User> = mutableSetOf()

    private val authorities = userAuthorityService.allAuthorities()
            .map { it.toName() }
            .toSet()

    init {
        create("Tommy")
        create("Ieniemienie")
        create("Pino")
        create("Bert")
        create("Ernie")
    }

    private final fun create(name: String) = UserAccountPasswordForm(
            name = name,
            email = "${name.toLowerCase()}@sesam.straat",
            password = name.toLowerCase(),
            authorities = authorities).save()

    private fun UserAccountPasswordForm.save(): User = userAccountService.createUserAccountPassword(this)
            .let { it.user }
            .also { data.add(it) }

}
