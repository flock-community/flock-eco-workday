package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.forms.PhotoChange
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.PersonPhoto
import community.flock.eco.workday.application.repository.PersonPhotoRepository
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.repositories.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.LocalDate
import java.util.Base64
import java.util.UUID

/** The photo as a data URL the browser can use directly as an `<img src>`. */
fun PersonPhoto.dataUrl(): String = "data:$contentType;base64,${Base64.getEncoder().encodeToString(data)}"

/** The image bytes of a base64 string, optionally a data URL (`data:image/png;base64,...`). */
fun decodeImage(value: String): ByteArray = Base64.getDecoder().decode(value.substringAfter("base64,").trim())

@Service
@Transactional
class PersonService(
    private val repository: PersonRepository,
    private val userRepository: UserRepository,
    private val photoRepository: PersonPhotoRepository,
) {
    private fun Person.render(form: PersonForm): Person {
        val user =
            when (form.userCode) {
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
            birthdate = form.birthdate,
            joinDate = form.joinDate,
            active = form.active,
            lastActiveAt = lastActiveAt(form),
            reminders = form.reminders,
            receiveEmail = form.receiveEmail,
            shoeSize = form.shoeSize,
            shirtSize = form.shirtSize,
            user = user,
            googleDriveId = form.googleDriveId,
            address = form.address?.toEntity(),
        )
    }

    /** Applies [photo] to the saved person. */
    private fun Person.change(photo: PhotoChange): Person =
        also {
            when (photo) {
                PhotoChange.Keep -> Unit
                PhotoChange.Remove -> photoRepository.deleteById(id)
                is PhotoChange.Replace -> photoRepository.save(PersonPhoto(id, photoContentType(photo.data), photo.data))
            }
        }

    /** The photo's content type, after checking it is a real image within [PersonPhoto.MAX_SIZE]. */
    private fun photoContentType(photo: ByteArray): String {
        if (photo.size > PersonPhoto.MAX_SIZE) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "photo may be at most ${PersonPhoto.MAX_SIZE / 1024} KB")
        }
        return LogoService.contentTypeOf(photo)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "photo must be a PNG, JPEG, GIF, WebP or SVG")
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
            false ->
                when (this.active) {
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

    fun findAll(pageable: Pageable): Page<Person> =
        repository
            .findAll(pageable)

    fun findAllByActive(
        pageable: Pageable,
        active: Boolean,
    ): Page<Person> =
        repository
            .findAllByActive(pageable, active)

    fun findByUuid(code: UUID): Person? =
        repository
            .findByUuid(code)
            .toNullable()

    fun findByUserCode(userCode: String) =
        repository
            .findByUserCode(userCode)
            .toNullable()

    fun findByPersonCodeIdIn(personCodes: List<UUID>) =
        repository
            .findByUuidIn(personCodes)

    fun findAllByFullName(
        pageable: Pageable,
        search: String,
    ) = repository
        .findAllByFullName(pageable, search)

    fun findAllPersonEvents(
        start: LocalDate,
        end: LocalDate,
    ): List<PersonEvent> =
        with(repository.findAllByActive(Pageable.unpaged(), active = true)) {
            val birthdays =
                this
                    .filter { it.birthdate?.isBetweenIgnoreYear(start, end) ?: false }
                    .map { PersonEvent(it, PersonEvent.EventType.BIRTHDAY, it.birthdate!!) }
            val joinDays =
                this
                    .filter { it.joinDate?.isBetweenIgnoreYear(start, end) ?: false }
                    .map { PersonEvent(it, PersonEvent.EventType.JOIN_DAY, it.joinDate!!) }

            birthdays.plus(joinDays).sortedBy { it.eventDate.withYear(1970) }
        }

    fun create(form: PersonForm): Person {
        val user =
            when (form.userCode) {
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
            birthdate = form.birthdate,
            joinDate = form.joinDate,
            user = user,
            active = form.active,
            lastActiveAt = if (form.active) null else Instant.now(),
            reminders = form.reminders,
            receiveEmail = form.receiveEmail,
            shoeSize = form.shoeSize,
            shirtSize = form.shirtSize,
            googleDriveId = form.googleDriveId,
            address = form.address?.toEntity(),
        ).save().change(form.photo)
    }

    fun update(
        code: UUID,
        form: PersonForm,
    ): Person? = findByUuid(code)?.render(form)?.save()?.change(form.photo)

    fun findPhoto(person: Person): PersonPhoto? = photoRepository.findById(person.id).toNullable()

    /** The photos of [persons] in one go, by person id; a person without a photo is left out. */
    fun findPhotos(persons: Iterable<Person>): Map<Long, PersonPhoto> =
        photoRepository.findAllByPersonIdIn(persons.map { it.id }.toSet()).associateBy { it.personId }

    @Transactional
    fun deleteByUuid(uuid: UUID) = repository.deleteByUuid(uuid)
}

fun Person.isUser(userCode: String?) = this.user?.code == userCode

fun LocalDate.isBetweenIgnoreYear(
    start: LocalDate,
    end: LocalDate,
): Boolean {
    var nextDate = this.withYear(start.year)
    if (nextDate.isBefore(start)) nextDate = nextDate.plusYears(1)
    return (nextDate.isAfter(start) || nextDate.isEqual(start)) && nextDate.isBefore(end)
}

data class PersonEvent(
    val person: Person,
    val eventType: EventType,
    val eventDate: LocalDate,
) {
    enum class EventType {
        JOIN_DAY,
        BIRTHDAY,
    }
}
