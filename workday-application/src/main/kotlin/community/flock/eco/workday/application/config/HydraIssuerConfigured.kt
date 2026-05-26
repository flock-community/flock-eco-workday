package community.flock.eco.workday.application.config

import org.springframework.context.annotation.Condition
import org.springframework.context.annotation.ConditionContext
import org.springframework.core.type.AnnotatedTypeMetadata

/**
 * Matches when the JWT issuer-uri is set and non-blank. Unlike `@ConditionalOnProperty`,
 * a blank value (which the test profile uses to disable the JWT chain) does not match.
 */
class HydraIssuerConfigured : Condition {
    override fun matches(
        context: ConditionContext,
        metadata: AnnotatedTypeMetadata,
    ): Boolean {
        val issuer = context.environment.getProperty("spring.security.oauth2.resourceserver.jwt.issuer-uri")
        return !issuer.isNullOrBlank()
    }
}
