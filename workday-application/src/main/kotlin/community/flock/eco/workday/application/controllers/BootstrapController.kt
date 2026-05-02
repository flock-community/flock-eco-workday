package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.Bootstrap
import community.flock.eco.workday.api.model.BootstrapResponse
import community.flock.eco.workday.application.services.PersonService
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController

@RestController
class BootstrapController(
    private val personService: PersonService,
) : Bootstrap.Handler {
    override suspend fun bootstrap(request: Bootstrap.Request): Bootstrap.Response<*> {
        val authentication = SecurityContextHolder.getContext().authentication
        return Bootstrap.Response200(
            BootstrapResponse(
                authorities = authentication?.authorities?.map { it.authority },
                loggedIn = authentication?.isAuthenticated ?: false,
                userId = authentication?.name,
                personId =
                    authentication?.name?.let {
                        personService.findByUserCode(it)?.uuid?.toString()
                    },
            ),
        )
    }
}
