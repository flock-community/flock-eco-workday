package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class PersonService(
    private val personRepository: PersonRepository
) {
    private fun Person.render(it: Person? = null): Person = Person(
                id = this.id,
                code = this.code,
                firstname = it?.firstname ?: this.firstname,
                lastname = it?.lastname ?: this.lastname,
                email = it?.email ?: this.email
    )
    private fun Person.save(): Person = personRepository.save(this)

    fun findAll(pageable: Pageable): Page<Person> {
        return personRepository
                .findAll(pageable)
    }

    fun findById(id: Long): Person? = personRepository
        .findById(id)
        .toNullable()

    fun create(person: Person): Person? = Person(
        firstname = person.firstname,
        lastname = person.lastname,
        email = person.email
    ).save()

    fun update(id: Long, person: Person? = null): Person? {
        val obj = this.findById(id)

        return when (obj) {
            is Person -> obj.render(person).save()
            else -> null
        }
    }

    fun deleteById(id: Long): Unit? {
        return when {
            personRepository.existsById(id) -> personRepository.deleteById(id)
            else -> null
        }
    }
}
