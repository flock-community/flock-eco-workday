package community.flock.eco.workday.application.exactonline.controllers

import com.fasterxml.jackson.databind.JsonNode
import community.flock.eco.workday.application.exactonline.clients.ExactonlineAccountClient
import community.flock.eco.workday.application.exactonline.services.ExactonlineAuthenticationService
import jakarta.servlet.http.HttpSession
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/exactonline/accounts")
class ExactonlineAccountController(
    private val exactonlineAuthenticationService: ExactonlineAuthenticationService,
    private val exactonlineAccountClient: ExactonlineAccountClient,
) {
    @GetMapping
    fun getAccountsAll(httpSession: HttpSession): Mono<JsonNode> =
        exactonlineAuthenticationService
            .accessToken(httpSession)
            .flatMap { requestObject ->

                exactonlineAccountClient.getAccounts(requestObject)
            }
}
