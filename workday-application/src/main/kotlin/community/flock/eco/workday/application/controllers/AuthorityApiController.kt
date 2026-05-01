package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.GetAuthorityAll
import community.flock.eco.workday.user.services.UserAuthorityService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.RestController

@RestController
class AuthorityApiController(
    private val userAuthorityService: UserAuthorityService,
) : GetAuthorityAll.Handler {
    @PreAuthorize("isAuthenticated()")
    override suspend fun getAuthorityAll(request: GetAuthorityAll.Request): GetAuthorityAll.Response<*> =
        GetAuthorityAll.Response200(
            userAuthorityService
                .allAuthorities()
                .map { it.toName() },
        )
}
