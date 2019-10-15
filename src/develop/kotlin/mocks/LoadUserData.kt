package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.feature.user.services.UserService
import org.springframework.stereotype.Component

@Component
class LoadUserData(
        private val userService: UserService,
        private val userAuthorityService: UserAuthorityService
) {
    val data: MutableSet<User> = mutableSetOf()

    private val authorities = userAuthorityService.allAuthorities()
            .map { it.toName() }
            .toSet()

    init {
        create("Willem Veelenturf", "willem.veelenturf@gmail.com")
        create("Pino", "pino@sesam.straat")
        create("Bert", "bert@sesam.straat")
        create("Ernie", "ernie@sesam.straat")
    }

    private final fun create(name: String, email: String) = UserForm(name = name, email = email, authorities = authorities).save()

    private fun UserForm.save(): User = userService.create(this)
            .also { data.add(it) }

}
