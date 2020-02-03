package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadUserData(
    private val userAccountService: UserAccountService,
    private val userAuthorityService: UserAuthorityService
) {
    val data: MutableSet<User> = mutableSetOf()

    val workerRoles = setOf(
        "HolidayAuthority.READ",
        "HolidayAuthority.WRITE",
        "SickdayAuthority.READ",
        "SickdayAuthority.WRITE")

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
        authorities = if (name == "Ernie") {
            authorities
                .filter { role -> workerRoles.contains(role) }.toSet()
        } else {
            authorities
        }).save()

    private fun UserAccountPasswordForm.save(): User = userAccountService.createUserAccountPassword(this)
        .let { it.user }
        .also { data.add(it) }
}
