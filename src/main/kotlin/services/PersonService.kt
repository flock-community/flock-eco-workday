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
import java.time.Instant
import java.util.*

@Service
class PersonService(
    private val repository: PersonRepository,
    private val userRepository: UserRepository
) {
    private fun Person.render(form: PersonForm): Person {
        val user = when (form.userCode) {
            is String -> userRepository.findByCode(form.userCode).toNullable()
            else -> null
        }

        return Person(
            id = this.id,
            uuid = this.uuid,
            firstname = form.firstname,
            lastname = form.lastname,
            email = form.email,
            position = form.position,
            number = form.number,
            active = form.active,
            lastActiveAt = lastActiveAt(form),
            reminders = form.reminders,
            updates = form.updates,
            user = user
        )
    }

    /**
     * Last active at is the point at which the person makes the transition from
     * active to inactive.
     */
    private fun Person.lastActiveAt(form: PersonForm): Instant? =
        when (form.active) {
            // When the entity is (made) active, last active at is not relevant
            // If it is set, clear it
            true -> null
            false -> when (this.active) {
                // Form entity is inactive, but saved entity is active, which means the
                // entity is made inactive in this request
                true -> Instant.now()
                // Saved entity was already inactive, don't update last active at
                // Other properties could be updated, but as long as the person stays
                // inactive, we should keep the last active at
                false -> this.lastActiveAt
            }
        }

    private fun Person.save(): Person = repository.save(this)

    fun findAll(pageable: Pageable): Page<Person> = repository
        .findAll(pageable)

    fun findAllByActive(pageable: Pageable, active: Boolean): Page<Person> = repository
        .findAllByActive(pageable, active)

    fun findByUuid(code: UUID): Person? = repository
        .findByUuid(code)
        .toNullable()

    fun findByUserCode(userCode: String) = repository
        .findByUserCode(userCode)
        .toNullable()

    fun findByUpdatesTrue() = repository
        .findAllByUpdates(true)

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
            user = user,
            active = form.active,
            lastActiveAt = if (form.active) null else Instant.now()
        ).save()
    }

    fun update(code: UUID, form: PersonForm): Person? =
        findByUuid(code)?.render(form)?.save()

    @Transactional
    fun deleteByUuid(uuid: UUID) = repository.deleteByUuid(uuid)
}

fun Person.isUser(userCode: String?) = this.user?.code == userCode
