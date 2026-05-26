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
 * Hydra-issued JWT → Authentication whose principal name is the workday `user.code`, so
 * downstream `personService.findByUserCode(authentication.name)` works as with every other
 * auth path. Signature/iss/exp are already validated by Spring's JwtDecoder; we take `sub`
 * (Kratos identity UUID) and delegate the user lookup to [KratosIdentityUserResolver].
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
        return UsernamePasswordAuthenticationToken(
            user.code,
            null,
            user.authorities.map { SimpleGrantedAuthority(it) },
        )
    }
}
