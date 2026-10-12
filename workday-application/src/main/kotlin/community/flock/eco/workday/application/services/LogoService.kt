package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.Logo
import community.flock.eco.workday.application.repository.LogoRepository
import jakarta.transaction.Transactional
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

    fun findById(id: UUID): Logo? = logoRepository.findById(id).orElse(null)

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
        logoRepository
            .findByNameIgnoreCase(trimmed)
            ?.takeIf { it.id != existing?.id }
            ?.let { throw LogoNameInUseException(trimmed) }
        val data = image ?: existing?.data ?: throw LogoInvalidInputException("image is required")
        if (data.size > Logo.MAX_SIZE) throw LogoInvalidInputException("image may be at most ${Logo.MAX_SIZE / 1024} KB")
        val contentType = contentTypeOf(data) ?: throw LogoInvalidInputException("image must be a PNG, JPEG, GIF, WebP or SVG")
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

    companion object {
        /** What the bytes are, not what the upload claims: the image is served as this type. */
        fun contentTypeOf(data: ByteArray): String? {
            fun startsWith(vararg bytes: Int) = data.size >= bytes.size && bytes.indices.all { data[it] == bytes[it].toByte() }

            fun ascii(
                from: Int,
                text: String,
            ) = data.size >= from + text.length && String(data, from, text.length, Charsets.US_ASCII) == text
            return when {
                startsWith(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A) -> "image/png"
                startsWith(0xFF, 0xD8, 0xFF) -> "image/jpeg"
                ascii(0, "GIF87a") || ascii(0, "GIF89a") -> "image/gif"
                ascii(0, "RIFF") && ascii(8, "WEBP") -> "image/webp"
                isSvg(data) -> "image/svg+xml"
                else -> null
            }
        }

        private fun isSvg(data: ByteArray): Boolean {
            val head = String(data, 0, minOf(data.size, 2048), Charsets.UTF_8).trimStart('﻿', ' ', '\n', '\r', '\t')
            return head.startsWith("<") && Regex("<svg[\\s>]", RegexOption.IGNORE_CASE).containsMatchIn(head)
        }
    }
}
