package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.authorities.AssignmentAuthority
import community.flock.eco.workday.application.authorities.EventAuthority
import community.flock.eco.workday.application.authorities.ExpenseAuthority
import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.authorities.SickdayAuthority
import community.flock.eco.workday.application.authorities.WorkDayAuthority
import community.flock.eco.workday.core.authorities.Authority
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserAuthorityService
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import community.flock.eco.workday.application.mocks.User as MockUser

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadUserData(
    private val userAccountService: UserAccountService,
    loadData: LoadData,
    userAuthorityService: UserAuthorityService,
) {
    private val log = LoggerFactory.getLogger(this::class.java)
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
            AssignmentAuthority.READ,
            EventAuthority.SUBSCRIBE,
        )

    private val allAuthorities = userAuthorityService.allAuthorities()
    private val workerAuthorities = userAuthorityService.allAuthorities().filter { workerRoles.contains(it) }

    init {
        loadData.load(false) { users.forEach { findOrCreate(it) } }
    }

    private final fun findOrCreate(user: MockUser): User {
        val email = "${user.firstName.lowercase()}@sesam.straat"
        return userAccountService
            .findUserAccountPasswordByUserEmail(email)
            ?.let {
                data.add(it.user)
                it.user
            }
            ?: UserAccountPasswordForm(
                name = user.firstName,
                email = email,
                password = user.firstName.lowercase(),
                authorities = user.authorities.map { it.toName() }.toSet(),
            ).save()
    }

    val MockUser.authorities: List<Authority>
        get() {
            return when (role) {
                Role.ADMIN -> allAuthorities
                Role.USER -> workerAuthorities
            }
        }

    private fun UserAccountPasswordForm.save(): User =
        userAccountService
            .createUserAccountPassword(this)
            .user
            .also { data.add(it) }
}
