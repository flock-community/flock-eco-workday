package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class PersonService(
    private val repository: PersonRepository,
    private val userRepository: UserRepository
) {
    private fun Person.render(it: PersonForm): Person {
        val user = when (it.userCode) {
            is String -> userRepository.findByCode(it.userCode).toNullable()
            else -> null
        }

        return Person(
            id = this.id,
            uuid = this.uuid,
            firstname = it.firstname,
            lastname = it.lastname,
            email = it.email,
            position = it.position,
            number = it.number,
            user = user
        )
    }

    private fun Person.save(): Person = repository.save(this)

    fun findAll(pageable: Pageable): Page<Person> = repository
        .findAll(pageable)

    fun findByUuid(code: UUID): Person? = repository
        .findByUuid(code)
        .toNullable()

    fun findByUserCode(userCode: String) = repository
        .findByUserCode(userCode)
        .toNullable()

    fun findByPersonCodeIdIn(personCodes: List<UUID>) = repository
        .findByUuidIn(personCodes)

    fun create(form: PersonForm): Person? {
        val user = when (form.userCode) {
            is String ->
                userRepository
                    .findByCode(form.userCode)
                    .toNullable()
            else -> null
        }

        return Person(
            firstname = form.firstname,
            lastname = form.lastname,
            email = form.email,
            position = form.position,
            number = form.number,
            user = user
        ).save()
    }

    fun update(code: UUID, form: PersonForm): Person? {
        val obj = this.findByUuid(code)

        return when (obj) {
            is Person -> obj.render(form).save()
            else -> null
        }
    }

    @Transactional
    fun deleteByUuid(uuid: String) = repository.deleteByUuid(uuid)
}

fun Person.isUser(userCode: String?) = this.user?.code == userCode
