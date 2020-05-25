package community.flock.eco.workday.mocks

import community.flock.eco.core.authorities.Authority
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.authorities.WorkDayAuthority
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
        HolidayAuthority.READ,
        HolidayAuthority.WRITE,
        SickdayAuthority.READ,
        SickdayAuthority.WRITE,
        WorkDayAuthority.READ,
        WorkDayAuthority.WRITE)

    private val allAuthorities = userAuthorityService.allAuthorities()
    private val workerAuthorities = userAuthorityService.allAuthorities().filter { workerRoles.contains(it) }

    init {
        create("Tommy", workerAuthorities)
        create("Ieniemienie", workerAuthorities)
        create("Pino", workerAuthorities)
        create("Bert", allAuthorities)
        create("Ernie", workerAuthorities)
    }

    private final fun create(name: String, authorities: List<Authority>) = UserAccountPasswordForm(
        name = name,
        email = "${name.toLowerCase()}@sesam.straat",
        password = name.toLowerCase(),
        authorities = authorities.map { it.toName() }.toSet())
        .save()

    private fun UserAccountPasswordForm.save(): User = userAccountService.createUserAccountPassword(this)
        .let { it.user }
        .also { data.add(it) }
}
