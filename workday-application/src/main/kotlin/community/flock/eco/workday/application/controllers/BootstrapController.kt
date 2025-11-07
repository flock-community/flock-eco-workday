package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.services.PersonService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bootstrap")
class BootstrapController(
    private val personService: PersonService,
) {
    @GetMapping
    fun bootstrap(authentication: Authentication?): ResponseEntity<Bootstrap> =
        ResponseEntity
            .ok(
                Bootstrap(
                    authorities = authentication?.authorities?.map { it.authority }?.toSet() ?: emptySet(),
                    isLoggedIn = authentication?.isAuthenticated ?: false,
                    userId = authentication?.name,
                    personId =
                        authentication?.name?.let {
                            personService.findByUserCode(it)?.uuid.toString()
                        },
                ),
            )
}

data class Bootstrap(
    val authorities: Set<String>,
    val isLoggedIn: Boolean,
    val userId: String?,
    val personId: String?,
)
