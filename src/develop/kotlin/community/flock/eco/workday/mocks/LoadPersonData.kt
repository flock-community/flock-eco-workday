package community.flock.eco.workday.mocks

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserAccountOauth
import community.flock.eco.feature.user.model.UserAccountOauthProvider
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.io.File
import java.io.IOException
import java.time.Instant
import java.time.LocalDate
import java.time.Period

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadPersonData(
    private val repository: PersonRepository,
    private val objectMapper: ObjectMapper,
    @Value("\${flock.eco.workday.login}")

    private val loginType: String,
    loadData: LoadData,
    userData: LoadUserData,
) {
    val data: MutableSet<Person> = mutableSetOf()

    /**
     * add save() func to model Person
     * call the PersonRepository´s save function passing the Person
     */
    fun Person.save(): Person = repository
        .save(this)
        .also {
            data.add(it)
        }

    fun findPersonByUserEmail(email: String): Person = data
        .find { it.user?.email == email }
        ?: error("Cannot find Client")

    fun findPersonByUserCode(code: String): Person = data
        .find { it.user?.code == code }
        ?: error("Cannot find Person")

    /**
     * createPerson() func
     * generate a Person model from given input values
     *
     * @param firstname firstname of the person
     * @param lastname lastname of the person
     * @param position (optional) job description or position of the user
     * @param user (optional) User model the person is attached to
     */
    private fun createPerson(
        firstname: String,
        lastname: String,
        position: String = "",
        birthdate: LocalDate? = null,
        joinDate: LocalDate? = null,
        user: User,
        active: Boolean = true,
        shoeSize: String? = null,
        shirtSize: String? = null,
    ) = Person(
        firstname = firstname,
        lastname = lastname,
        email = user.email,
        position = position,
        number = null,
        birthdate = birthdate,
        joinDate = joinDate,
        user = user,
        active = active,
        lastActiveAt = if (!active) Instant.now().minus(Period.ofDays(180)) else null,
        shoeSize = shoeSize,
        shirtSize = shirtSize,
    ).save()

    /**
     * Initialize the users by calling the createPerson() func
     * iterate over userData and create a person for every user in userData
     */
    init {
        loadData.loadWhenEmpty {
            val userMap = userData.data.associateBy { it.name }

            val persons = mockUsers.map {
                createPerson(
                    firstname = it.firstName,
                    lastname = it.lastName,
                    birthdate = it.birthdate,
                    joinDate = it.joinDate,
                    user = userMap[it.firstName]
                        ?: throw IllegalStateException("User not found with name ${it.firstName}"),
                    active = it.active,
                    shoeSize = it.shoeSize,
                    shirtSize = it.shirtSize,
                )
            }

            if (loginType == "KRATOS") {

                val kratosIds: List<String> = getKratosIdentities().map { it.id }
                persons.mapNotNull { person ->
                    val kratosReferences =
                        person.user?.accounts
                            ?.filter { a -> a is UserAccountOauth && a.provider == UserAccountOauthProvider.KRATOS }
                            ?.map { (it as UserAccountOauth).reference } ?: emptyList()

                    val kratosId = kratosIds.firstOrNull { kratosReferences.contains(it) }
                    kratosId?.let {
                        UserPerson(kratosId, person.uuid.toString())
                    }

                }
                    .let { writeUserPersonRelations(it) }
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


    private fun writeUserPersonRelations(linkedPersons: List<UserPerson>) = try {
        // TODO Push changes to keto directly
        LOG.info("Writing person-user relation to file ${PERSON_USER_RELATIONS_FILE_LOCATION}:  $linkedPersons")
        val file = File(PERSON_USER_RELATIONS_FILE_LOCATION)
        file.createNewFile()
        objectMapper.writeValue(
            file,
            linkedPersons
        )
    } catch (e: IOException) {
        LOG.warn("Could not write to $PERSON_USER_RELATIONS_FILE_LOCATION.Something went wrong", e)
        throw IllegalStateException(
            "Could not write to $PERSON_USER_RELATIONS_FILE_LOCATION.Something went wrong", e
        )

    }


    companion object {
        private const val KRATOS_IDENTITIES_FILE_LOCATION = "./docker/kratos/identities/existing_identities.json"
        private const val PERSON_USER_RELATIONS_FILE_LOCATION =
            "./docker/keto/relations/workday_person_relations.json"
        private val LOG: Logger = LoggerFactory.getLogger(LoadPersonData::class.java)

    }
}
