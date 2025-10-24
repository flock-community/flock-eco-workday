package community.flock.eco.feature.user.controllers

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/login")
class UserStatusController {
    data class Status(
        val isLoggedIn: Boolean,
        val authorities: List<String>,
    )

    @GetMapping("/status")
    fun index(principal: Principal?) =
        Status(
            isLoggedIn = principal != null,
            authorities = if (principal is AbstractAuthenticationToken) principal.authorities.map { it.authority } else listOf(),
        )
}
