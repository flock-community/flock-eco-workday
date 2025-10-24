package community.flock.eco.feature.user.controllers

import community.flock.eco.feature.user.services.UserAuthorityService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/authorities")
class UserAuthorityController(
    private val userAuthorityService: UserAuthorityService,
) {
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    fun findMeUserAuthority(): List<String> =
        userAuthorityService
            .allAuthorities()
            .map { it.toName() }
}
