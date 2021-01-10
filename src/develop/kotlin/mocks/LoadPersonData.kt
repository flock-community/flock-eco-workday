package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadPersonData(
    private val userData: LoadUserData,
    private val repository: PersonRepository
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
        user: User
    ) = Person(
            firstname = firstname,
            lastname = lastname,
            email = user.email,
            position = position,
            number = null,
            user = user
        ).save()

    /**
     * Initialize the users by calling the createPerson() func
     * iterate over userData and create a person for every user in userData
     */
    init {
        val lastnames = arrayOf("Dog", "Mouse", "Woodpecker", "Muppets", "Muppets")
        userData.data.forEachIndexed { idx, user ->
            createPerson(firstname = user.name!!, lastname = lastnames[idx], user = user)
        }
    }
}
