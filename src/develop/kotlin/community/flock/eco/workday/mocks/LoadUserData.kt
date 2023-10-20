package community.flock.eco.workday.mocks

import community.flock.eco.core.authorities.Authority
import community.flock.eco.feature.user.forms.UserAccountOauthForm
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserAccountOauthProvider
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.workday.authorities.ExpenseAuthority
import community.flock.eco.workday.authorities.LeaveDayAuthority
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.authorities.WorkDayAuthority
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component


@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadUserData(
    @Value("\${flock.eco.workday.login}")
    private val loginType: String,
    private val userAccountService: UserAccountService,
    private val kratosClient: KratosClient,
    loadData: LoadData,
    userAuthorityService: UserAuthorityService,
) {

    val data: MutableSet<User> = mutableSetOf()

    val workerRoles = setOf(
        LeaveDayAuthority.READ,
        LeaveDayAuthority.WRITE,
        SickdayAuthority.READ,
        SickdayAuthority.WRITE,
        WorkDayAuthority.READ,
        WorkDayAuthority.WRITE,
        WorkDayAuthority.TOTAL_HOURS,
        ExpenseAuthority.READ,
        ExpenseAuthority.WRITE
    )
    private val allAuthorities = userAuthorityService.allAuthorities()

    private val workerAuthorities = userAuthorityService.allAuthorities().filter { workerRoles.contains(it) }

    init {
        loadData.loadWhenEmpty {
            if (loginType == "KRATOS") {
                val identities = kratosClient.getKratosIdentities()
                mockUsers.forEach {
                    val kratosId = kratosClient.getOrCreateIdentities(it, identities)
                    createUserAccountOAuth(it, kratosId)
                }
            } else {
                mockUsers.forEach { createUserAccountPassword(it) }
            }
        }
    }

    private final fun createUserAccountPassword(mockUser: MockUser) = UserAccountPasswordForm(
        name = mockUser.firstName,
        email = mockUser.email,
        password = mockUser.firstName.lowercase(),
        authorities = mockUser.authorities.map { it.toName() }.toSet()
    )
        .save()

    private final fun createUserAccountOAuth(mockUser: MockUser, kratosIdentity: KratosIdentity): User =
        UserAccountOauthForm(
            name = mockUser.firstName,
            email = mockUser.email,
            provider = UserAccountOauthProvider.KRATOS,
            reference = kratosIdentity.id,
            authorities = mockUser.authorities.map { it.toName() }.toSet()
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
            .also {
                val allAccounts = userAccountService.findUserAccountByUserCode(it.code)
                data.add(it.copy(accounts = allAccounts.toSet()))
            }

    private fun UserAccountOauthForm.save(): User =
        userAccountService.createUserAccountOauth(this)
            .user
            .also {
                val allAccounts = userAccountService.findUserAccountByUserCode(it.code)
                data.add(it.copy(accounts = allAccounts.toSet()))
            }
}
