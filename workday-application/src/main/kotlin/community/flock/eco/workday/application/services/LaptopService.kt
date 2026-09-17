package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.LaptopForm
import community.flock.eco.workday.application.model.Laptop
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.LaptopRepository
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.UUID

/** Thrown when a laptop form cannot be turned into a valid laptop. */
sealed class LaptopValidationException(
    override val message: String,
) : RuntimeException(message)

class LaptopInvalidInputException(
    message: String,
) : LaptopValidationException(message)

class LaptopSerialNumberInUseException(
    serialNumber: String,
) : LaptopValidationException("A laptop with serial number '$serialNumber' is already registered")

class LaptopPersonNotFoundException(
    personId: UUID,
) : LaptopValidationException("Person $personId not found")

@Service
class LaptopService(
    private val laptopRepository: LaptopRepository,
    private val personRepository: PersonRepository,
) {
    fun findAll(pageable: Pageable): Page<Laptop> = laptopRepository.findAll(pageable)

    fun findAllByPersonUuid(
        personUuid: UUID,
        pageable: Pageable,
    ): Page<Laptop> = laptopRepository.findAllByPersonUuid(personUuid, pageable)

    fun findByCode(code: String): Laptop? = laptopRepository.findByCode(code)

    @Transactional
    fun create(form: LaptopForm): Laptop = form.internalize().save()

    @Transactional
    fun update(
        code: String,
        form: LaptopForm,
    ): Laptop? = findByCode(code)?.let { form.internalize(it).save() }

    @Transactional
    fun deleteByCode(code: String) = laptopRepository.deleteByCode(code)

    /**
     * Builds the laptop to persist. The serial number must be unique across laptops
     * (ignoring case); when updating, the laptop being updated may of course keep its
     * own serial number. Presence and shape of the fields are the contract's concern.
     */
    private fun LaptopForm.internalize(existing: Laptop? = null): Laptop {
        val name = name.trim()
        val serialNumber = serialNumber.trim()

        laptopRepository
            .findBySerialNumberIgnoreCase(serialNumber)
            ?.takeIf { it.id != existing?.id }
            ?.let { throw LaptopSerialNumberInUseException(serialNumber) }

        return Laptop(
            id = existing?.id ?: 0,
            code = existing?.code ?: UUID.randomUUID().toString(),
            name = name,
            serialNumber = serialNumber,
            contractSigned = contractSigned,
            purchaseDate = purchaseDate,
            person = personId?.let { findPerson(it) },
        )
    }

    private fun findPerson(personId: UUID): Person =
        personRepository
            .findByUuid(personId)
            .toNullable()
            ?: throw LaptopPersonNotFoundException(personId)

    private fun Laptop.save(): Laptop = laptopRepository.save(this)
}
