package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadPersonData(
    private val repository: PersonRepository
) {
    val data: MutableSet<Person> = mutableSetOf()

    /** add save() func to model Person
     * call the PersonRepository´s save function passing the Person
     */
    fun Person.save(): Person = repository
        .save(this)
        .also {
            data.add(it)
        }

    /** createPerson() func
     * generate a Person model from given input values
     *
     * @param firstname firstname of the person
     * @param lastname lastname of the person
     * @param email (optional) the email of the person.
     */
    private final fun createPerson(firstname: String, lastname: String, email: String = "")  = Person(
            firstname = firstname,
            lastname = lastname,
            email = email
        ).save()

    /**
     * Initialize the users by calling the createPerson() func
     */
    init {
        createPerson("Tommy", "Dog")
        createPerson("Ieniemienie", "Mouse")
        createPerson("Pino", "Woodpecker")
        createPerson("Bert", "Muppets")
        createPerson("Ernie", "Muppets")
    }
}
