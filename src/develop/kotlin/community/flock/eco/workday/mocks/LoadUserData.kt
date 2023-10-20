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
import community.flock.eco.workday.authorities.LeaveDayAuthority
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.PersonService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.io.File
import java.io.IOException
import javax.transaction.Transactional


@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadUserData(
        @Value("\${flock.eco.workday.login}")
    private val loginType: String,
        private val userAccountService: UserAccountService,
        private val objectMapper: ObjectMapper,
        private val personService: PersonService,
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
        extracted(loadData)
    }

    @Transactional
    fun extracted(loadData: LoadData) {
        loadData.loadWhenEmpty {
            if (loginType == "KRATOS") {
                // TODO Create user in Kratos first (!) Use API
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

    data class UserPerson(
        val userId: String,
        val personId: String,
        val relation: String = "owners"
    )

    private fun writeUserPersonRelations(linkedPersons: List<Person>) = try {
        LOG.info("Writing person-user relation to file $PERSON_USER_RELATIONS_FILE_LOCATION:  ${linkedPersons.map { it.email }}")
        objectMapper.writeValue(File(PERSON_USER_RELATIONS_FILE_LOCATION), linkedPersons.map {
            UserPerson(
                userId = it.user!!.code,
                personId = it.uuid.toString()
            )
        })
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

    companion object {
        private const val KRATOS_IDENTITIES_FILE_LOCATION = "./docker/kratos/identities/existing_identities.json"
        private const val PERSON_USER_RELATIONS_FILE_LOCATION = "./docker/keto/relations/workday_person_relations.json"
        private val LOG: Logger = LoggerFactory.getLogger(LoadUserData::class.java)
    }
}
