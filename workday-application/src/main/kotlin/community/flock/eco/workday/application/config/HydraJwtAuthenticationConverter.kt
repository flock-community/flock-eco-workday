package community.flock.eco.workday.application.config

import community.flock.eco.workday.user.model.User
import org.springframework.context.annotation.Conditional
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException
import org.springframework.stereotype.Component

/**
 * Spring Security converter: Hydra-issued JWT → an [Authentication] whose principal name
 * is the workday `user.code` — matches the contract every other auth path on this app
 * uses ([UserKeyTokenFilter], the legacy googleLogin filter, PR #488's opaque-token
 * introspector). Downstream code keeps calling `personService.findByUserCode(authentication.name)`.
 *
 * JWT signature + iss/exp/nbf are already validated by Spring's [JwtDecoder] before we
 * get here (Hydra JWKS, cached). We extract `sub` (Kratos identity UUID) and delegate to
 * [KratosIdentityUserResolver] for the user lookup.
 *
 * See ADR 0003 (in the flock-app repo) and plan-W1 in mobile-mvp-plan.md.
 */
@Component
@Conditional(HydraIssuerConfigured::class)
class HydraJwtAuthenticationConverter(
    private val userResolver: KratosIdentityUserResolver,
) : Converter<Jwt, AbstractAuthenticationToken> {
    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        val sub =
            jwt.subject
                ?: throw InvalidBearerTokenException("JWT had no sub claim")
        val user: User = userResolver.resolve(sub, jwt.tokenValue)
        // Principal name = user.code so authentication.name flows through unchanged.
        return UsernamePasswordAuthenticationToken(
            user.code,
            null,
            user.authorities.map { SimpleGrantedAuthority(it) },
        )
    }
}
