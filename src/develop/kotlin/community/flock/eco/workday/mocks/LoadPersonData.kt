package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserAccountOauth
import community.flock.eco.feature.user.model.UserAccountOauthProvider
import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import community.flock.wirespec.generated.SubjectSet
import kotlinx.coroutines.runBlocking
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.LocalDate
import java.time.Period

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadPersonData(
    private val repository: PersonRepository,
    private val ketoClient: KetoClientConfiguration.KetoClient,
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

            val persons = mockUsers.asSequence()
                .map {
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
                }.map {
                    createKetoRelationForPersonAndUserAccounts(it)
                    it
                }.groupBy { if (it.user?.authorities?.any { a -> a.endsWith("ADMIN") } == true) "admin" else "worker" }

            if (loginType == "KRATOS") {
                persons["admin"]?.forEach { admin ->
                    persons["worker"]?.forEach { worker ->
                        createKetoRelationBetweenKratosAdminAndWorker(admin, worker)

                    }
                }
            }
        }
    }

    private fun createKetoRelationBetweenKratosAdminAndWorker(admin: Person, worker: Person) = runBlocking {
        val body = CreateRelationshipBody(
            namespace = "Person",
            `object` = worker.uuid.toString(),
            relation = "managers",
            subject_set = SubjectSet(
                namespace = "Person",
                `object` = admin.uuid.toString(),
                relation = ""
            ),
        )

        val createRelationship = ketoClient.createRelationship(
            CreateRelationship.RequestApplicationJson(
                body
            )
        )
        if (createRelationship.status > 299) {
            error("Some error occurred creating relationship $body. Error: ${createRelationship.content?.body}")
        }
    }

    private fun createKetoRelationForPersonAndUserAccounts(person: Person) {
        val kratosUserIds =
            (person.user
                ?.accounts
                ?.filter { ua -> ua is UserAccountOauth && ua.provider == UserAccountOauthProvider.KRATOS } as List<UserAccountOauth>?)
                ?.map { it.reference }
                ?: emptyList()

        kratosUserIds.forEach {
            runBlocking { createRelationBetweenPersonAndUser(person, it) }
        }
    }

    private suspend fun createRelationBetweenPersonAndUser(person: Person, kratosUserId: String) {
        val body = CreateRelationshipBody(
            namespace = "Person",
            `object` = person.uuid.toString(),
            relation = "owners",
            subject_set = SubjectSet(
                namespace = "User",
                `object` = kratosUserId,
                relation = ""
            ),
        )

        val createRelationship = ketoClient.createRelationship(
            CreateRelationship.RequestApplicationJson(body)
        )
        if (createRelationship.status > 299) {
            error("Some error occurred creating relationship $body. Error: ${createRelationship.content?.body}")
        }
    }

}
