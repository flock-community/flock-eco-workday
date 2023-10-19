package community.flock.eco.workday.mocks

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import community.flock.eco.core.authorities.Authority
import community.flock.eco.feature.user.forms.UserAccountOauthForm
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserAccountOauthProvider
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.workday.authorities.ExpenseAuthority
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.authorities.LeaveDayAuthority
import org.slf4j.LoggerFactory
import org.slf4j.Logger
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.io.File
import java.io.IOException


@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadUserData(
        @Value("\${flock.eco.workday.login}")
    private val loginType: String,
        private val userAccountService: UserAccountService,
        private val objectMapper: ObjectMapper,
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
                mockUsers.forEach { createUserAccountOAuth(it, getKratosIdentities()) }
            } else {
                mockUsers.forEach { createUserAccountPassword(it) }
            }
        }
    }

    private fun getKratosIdentities() = try {
        objectMapper.readValue<List<KratosIdentity>>(File(KRATOS_IDENTITIES_FILE_LOCATION))
    } catch (e: IOException) {
        LOG.warn("Could not find existing Kratos identities. Will create users without Kratos link")
        throw IllegalStateException(
            "Kratos identities could not be found and linked to users known in Workday. " +
                "Be sure to run `docker compose up -d` to generate the kratos identity file"
        )
    }

    private final fun createUserAccountPassword(mockUser: MockUser) = UserAccountPasswordForm(
        name = mockUser.firstName,
        email = "${mockUser.firstName.lowercase()}@sesam.straat",
        password = mockUser.firstName.lowercase(),
        authorities = mockUser.authorities.map { it.toName() }.toSet()
    )
        .save()


    private final fun createUserAccountOAuth(mockUser: MockUser, kratosIdentities: List<KratosIdentity>): User {
        val email = "${mockUser.firstName.lowercase()}@sesam.straat"
        return UserAccountOauthForm(
            name = mockUser.firstName,
            email = email,
            provider = UserAccountOauthProvider.KRATOS,
            reference = kratosIdentities.find { it.email == email }?.id ?: mockUser.kratosId,
            authorities = mockUser.authorities.map { it.toName() }.toSet()
        )
            .save()
    }

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

    private fun UserAccountOauthForm.save(): User =
        userAccountService.createUserAccountOauth(this)
            .user
            .also { data.add(it) }

    companion object {
        private const val KRATOS_IDENTITIES_FILE_LOCATION = "./docker/kratos/identities/existing_identities.json"
        private val LOG: Logger = LoggerFactory.getLogger(LoadUserData::class.java)
    }
}
