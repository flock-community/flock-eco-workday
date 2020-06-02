package community.flock.eco.feature.exactonline.controllers;

import community.flock.eco.feature.exactonline.clients.ExactonlineUserClient
import community.flock.eco.workday.exactonline.services.ExactonlineAuthenticationService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import java.net.URI
import javax.servlet.http.HttpSession

@RestController
@RequestMapping("/api/exactonline")
class ExactonlineAuthenticationController(
    private val exactonlineAuthenticationService: ExactonlineAuthenticationService,
    private val userClient: ExactonlineUserClient
) {

    @GetMapping("status")
    fun getStatus(
        httpSession: HttpSession
    ): Mono<Map<String, Any?>> = exactonlineAuthenticationService
        .accessToken(httpSession)
        .flatMap { accessToken ->
            userClient.getCurrentMe(accessToken)
                .map { res ->
                    mapOf(
                        "active" to true,
                        "user" to res
                    )
                }

        }
        .defaultIfEmpty(mapOf<String, Any?>(
            "active" to false
        ))

    @GetMapping("authorize")
    fun getAuthorize(
        session: HttpSession,
        @RequestParam redirect_url: String?
    ): ResponseEntity<Unit> {
        if (redirect_url != null) {
            exactonlineAuthenticationService.storeRedirectUri(session, URI(redirect_url))
        }
        return exactonlineAuthenticationService
            .authorizationUrl()
            .toUri()
            .redirect()
    }

    @GetMapping("redirect")
    fun getRedirect(
        session: HttpSession,
        @RequestParam code: String) = exactonlineAuthenticationService
        .authenticate(session, code)
        .map {
            (exactonlineAuthenticationService.getRedirectUri(session)
                ?: URI("/api/exactonline/status"))
                .redirect()
        }

    private fun URI.redirect(): ResponseEntity<Unit> {
        val headers = HttpHeaders()
        headers.location = this
        return ResponseEntity(headers, HttpStatus.MOVED_PERMANENTLY)
    }
}

