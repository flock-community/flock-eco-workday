package community.flock.eco.feature.exactonline.controllers

import community.flock.eco.feature.exactonline.clients.ExactonlineDivisionClient
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
    private val userClient: ExactonlineUserClient,
    private val divisionClient: ExactonlineDivisionClient,
) {
    @GetMapping("status")
    fun getStatus(httpSession: HttpSession): Mono<Map<String, Any?>> =
        exactonlineAuthenticationService
            .accessToken(httpSession)
            .flatMap { requestObject ->
                val user = userClient.getCurrentMe(requestObject.accessToken)
                val division = divisionClient.getDivisionByCode(requestObject, requestObject.division)
                Mono.zip(user, division)
                    .map { res ->
                        mapOf(
                            "active" to true,
                            "user" to res.t1,
                            "division" to res.t2,
                        )
                    }
            }
            .defaultIfEmpty(
                mapOf<String, Any?>(
                    "active" to false,
                ),
            )

    @GetMapping("authorize")
    fun getAuthorize(
        session: HttpSession,
        @RequestParam(name = "redirect_url", required = false) redirectUrl: String?,
    ): ResponseEntity<Unit> {
        if (redirectUrl != null) {
            exactonlineAuthenticationService.storeRedirectUri(session, URI(redirectUrl))
        }
        return exactonlineAuthenticationService
            .authorizationUrl()
            .toUri()
            .redirect()
    }

    @GetMapping("redirect")
    fun getRedirect(
        session: HttpSession,
        @RequestParam code: String,
    ): Mono<ResponseEntity<Unit>> =
        exactonlineAuthenticationService
            .authenticate(session, code)
            .map {
                (
                    exactonlineAuthenticationService.getRedirectUri(session)
                        ?: URI("/api/exactonline/status")
                )
                    .redirect()
            }

    private fun URI.redirect(): ResponseEntity<Unit> {
        val headers = HttpHeaders()
        headers.location = this
        return ResponseEntity(headers, HttpStatus.MOVED_PERMANENTLY)
    }
}
