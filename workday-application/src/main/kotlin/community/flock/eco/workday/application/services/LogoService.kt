package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.Logo
import community.flock.eco.workday.application.repository.LogoRepository
import community.flock.eco.workday.application.utils.imageContentType
import jakarta.transaction.Transactional
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

/** Thrown when a logo cannot be stored as asked. */
sealed class LogoValidationException(
    override val message: String,
) : RuntimeException(message)

class LogoInvalidInputException(
    message: String,
) : LogoValidationException(message)

class LogoNameInUseException(
    name: String,
) : LogoValidationException("There already is a logo named '$name'")

@Service
class LogoService(
    private val logoRepository: LogoRepository,
) {
    /** By name, ignoring case: bol.com among the B's. */
    fun findAll(): List<Logo> = logoRepository.findAll().sortedBy { it.name.lowercase() }

    fun findById(id: UUID): Logo? = logoRepository.findByIdOrNull(id)

    fun exists(id: UUID): Boolean = logoRepository.existsById(id)

    @Transactional
    fun create(
        name: String,
        image: ByteArray,
    ): Logo = save(null, name, image)

    /** Renames the logo and, when an [image] is given, replaces its image. */
    @Transactional
    fun update(
        id: UUID,
        name: String,
        image: ByteArray?,
    ): Logo? = findById(id)?.let { save(it, name, image) }

    @Transactional
    fun delete(id: UUID): Boolean {
        if (!logoRepository.existsById(id)) return false
        logoRepository.clearFromExperiences(id)
        logoRepository.deleteById(id)
        return true
    }

    private fun save(
        existing: Logo?,
        name: String,
        image: ByteArray?,
    ): Logo {
        val trimmed = name.trim()
        val namesake = logoRepository.findByNameIgnoreCase(trimmed)
        if (namesake != null && namesake.id != existing?.id) throw LogoNameInUseException(trimmed)
        val data = image ?: existing?.data ?: throw LogoInvalidInputException("image is required")
        if (data.size > Logo.MAX_SIZE) throw LogoInvalidInputException("image may be at most ${Logo.MAX_SIZE / 1024} KB")
        val contentType = data.imageContentType() ?: throw LogoInvalidInputException("image must be a PNG, JPEG, GIF, WebP or SVG")
        return logoRepository.save(
            Logo(
                id = existing?.id ?: UUID.randomUUID(),
                name = trimmed,
                contentType = contentType,
                data = data,
                updatedAt = Instant.now(),
            ),
        )
    }
}
