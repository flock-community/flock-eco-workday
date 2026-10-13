package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteLogo
import community.flock.eco.workday.api.endpoint.GetLogoAll
import community.flock.eco.workday.api.endpoint.PostLogo
import community.flock.eco.workday.api.endpoint.PutLogo
import community.flock.eco.workday.api.model.Error
import community.flock.eco.workday.api.model.LogoName
import community.flock.eco.workday.application.model.Logo
import community.flock.eco.workday.application.services.LogoInvalidInputException
import community.flock.eco.workday.application.services.LogoNameInUseException
import community.flock.eco.workday.application.services.LogoService
import community.flock.eco.workday.application.services.LogoValidationException
import community.flock.eco.workday.application.utils.decodeBase64Image
import org.springframework.http.CacheControl
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.time.Duration
import community.flock.eco.workday.api.model.Logo as LogoApi

/**
 * The logos everybody shares for their CVs. Anybody signed in sees them; whoever may
 * write a CV may add one, and only a CV admin changes or deletes them, since a change
 * shows on the CVs of others.
 */
@RestController
class LogoController(
    private val logoService: LogoService,
) : GetLogoAll.Handler,
    PostLogo.Handler,
    PutLogo.Handler,
    DeleteLogo.Handler {
    @PreAuthorize("isAuthenticated()")
    override suspend fun getLogoAll(request: GetLogoAll.Request): GetLogoAll.Response<*> =
        GetLogoAll.Response200(logoService.findAll().map { it.externalize() })

    @PreAuthorize("hasAnyAuthority('CvAuthority.WRITE', 'CvAuthority.ADMIN')")
    override suspend fun postLogo(request: PostLogo.Request): PostLogo.Response<*> =
        validated(onConflict = { PostLogo.Response409(it) }, onBadRequest = { PostLogo.Response400(it) }) {
            val image = request.body.image?.decoded() ?: throw LogoInvalidInputException("image is required")
            PostLogo.Response200(logoService.create(request.body.name.validated(), image).externalize())
        }

    @PreAuthorize("hasAuthority('CvAuthority.ADMIN')")
    override suspend fun putLogo(request: PutLogo.Request): PutLogo.Response<*> =
        validated(onConflict = { PutLogo.Response409(it) }, onBadRequest = { PutLogo.Response400(it) }) {
            val id = request.path.id.toUuidOrNull() ?: return PutLogo.Response404(Error("Logo not found"))
            logoService
                .update(id, request.body.name.validated(), request.body.image?.decoded())
                ?.let { PutLogo.Response200(it.externalize()) }
                ?: PutLogo.Response404(Error("Logo not found"))
        }

    @PreAuthorize("hasAuthority('CvAuthority.ADMIN')")
    override suspend fun deleteLogo(request: DeleteLogo.Request): DeleteLogo.Response<*> =
        request.path.id
            .toUuidOrNull()
            ?.takeIf { logoService.delete(it) }
            ?.let { DeleteLogo.Response204(Unit) }
            ?: DeleteLogo.Response404(Error("Logo not found"))

    /**
     * The image itself, for `<img src>`; wirespec has no binary responses. An SVG can
     * hold script: the policy keeps it from running when the image is opened on its own.
     */
    @GetMapping("/api/logos/{id}/image")
    @PreAuthorize("isAuthenticated()")
    fun getLogoImage(
        @PathVariable id: String,
    ): ResponseEntity<ByteArray> {
        val logo = id.toUuidOrNull()?.let { logoService.findById(it) } ?: return ResponseEntity.notFound().build()
        return ResponseEntity
            .ok()
            .contentType(MediaType.parseMediaType(logo.contentType))
            .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePrivate())
            .eTag(logo.updatedAt.toEpochMilli().toString())
            .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
            .header("X-Content-Type-Options", "nosniff")
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
            .body(logo.data)
    }

    private inline fun <R> validated(
        onConflict: (Error) -> R,
        onBadRequest: (Error) -> R,
        block: () -> R,
    ): R =
        try {
            block()
        } catch (e: LogoNameInUseException) {
            onConflict(Error(e.message))
        } catch (e: LogoValidationException) {
            onBadRequest(Error(e.message))
        }

    private fun LogoName.validated(): String =
        when {
            validate() -> value.trim()
            value.isBlank() -> throw LogoInvalidInputException("name is required")
            else -> throw LogoInvalidInputException("name may be at most ${Logo.NAME_LENGTH} characters")
        }

    /** The image as base64, optionally as a data URL (`data:image/png;base64,...`). */
    private fun String.decoded(): ByteArray =
        runCatching { decodeBase64Image() }
            .getOrElse { throw LogoInvalidInputException("image is not valid base64") }

    private fun Logo.externalize() =
        LogoApi(
            id = id.toString(),
            name = name,
            contentType = contentType,
            updatedAt = updatedAt.toString(),
        )
}
