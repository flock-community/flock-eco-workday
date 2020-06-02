package community.flock.eco.feature.exactonline.controllers;

import com.fasterxml.jackson.databind.JsonNode
import community.flock.eco.feature.exactonline.clients.ExactonlineAccountClient;
import community.flock.eco.feature.exactonline.clients.ExactonlineUserClient
import community.flock.eco.workday.exactonline.services.ExactonlineAuthenticationService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono
import javax.servlet.http.HttpSession

@RestController
@RequestMapping("/api/exactonline/accounts")
public class ExactonlineAccountController(
    private val exactonlineAuthenticationService: ExactonlineAuthenticationService,
    private val exactonlineAccountClient: ExactonlineAccountClient,
    private val exactonlineUserClient: ExactonlineUserClient
) {

    @GetMapping
    fun getAccountsAll(
        httpSession: HttpSession
    ): Mono<JsonNode> = exactonlineAuthenticationService
        .accessToken(httpSession)
        .flatMap {accessToken ->
            exactonlineUserClient.getCurrentMe(accessToken)
                .flatMap {user ->
                    exactonlineAccountClient.getAccounts(accessToken, user.currentDivision)
                }
        }


}
