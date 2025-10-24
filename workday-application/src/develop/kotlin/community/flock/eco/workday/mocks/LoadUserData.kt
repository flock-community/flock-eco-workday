package community.flock.eco.workday.mocks

import community.flock.eco.workday.application.authorities.ExpenseAuthority
import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.authorities.SickdayAuthority
import community.flock.eco.workday.application.authorities.WorkDayAuthority
import community.flock.eco.workday.core.authorities.Authority
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserAuthorityService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import community.flock.eco.workday.mocks.User as MockUser

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadUserData(
    private val userAccountService: UserAccountService,
    loadData: LoadData,
    userAuthorityService: UserAuthorityService,
) {
    val data: MutableSet<User> = mutableSetOf()

    val workerRoles =
        setOf(
            LeaveDayAuthority.READ,
            LeaveDayAuthority.WRITE,
            SickdayAuthority.READ,
            SickdayAuthority.WRITE,
            WorkDayAuthority.READ,
            WorkDayAuthority.WRITE,
            WorkDayAuthority.TOTAL_HOURS,
            ExpenseAuthority.READ,
            ExpenseAuthority.WRITE,
        )

    private val allAuthorities = userAuthorityService.allAuthorities()
    private val workerAuthorities = userAuthorityService.allAuthorities().filter { workerRoles.contains(it) }

    init {
        loadData.loadWhenEmpty {
            users.forEach { create(it) }
        }
    }

    private final fun create(user: MockUser) =
        UserAccountPasswordForm(
            name = user.firstName,
            email = "${user.firstName.lowercase()}@sesam.straat",
            password = user.firstName.lowercase(),
            authorities = user.authorities.map { it.toName() }.toSet(),
        )
            .save()

    val MockUser.authorities: List<Authority>
        get() {
            return when (role) {
                Role.ADMIN -> allAuthorities
                Role.USER -> workerAuthorities
            }
        }

    private fun UserAccountPasswordForm.save(): User =
        userAccountService.createUserAccountPassword(this)
            .user
            .also { data.add(it) }
}
