package community.flock.eco.workday.application.config

import org.springframework.context.annotation.Condition
import org.springframework.context.annotation.ConditionContext
import org.springframework.core.type.AnnotatedTypeMetadata

/**
 * Matches when `spring.security.oauth2.resourceserver.jwt.issuer-uri` is set to a
 * non-empty value. The default `@ConditionalOnProperty` matches an empty string too,
 * which the test profile uses to disable the JWT chain — this condition lets us cleanly
 * skip the Hydra-backed beans there.
 */
class HydraIssuerConfigured : Condition {
    override fun matches(context: ConditionContext, metadata: AnnotatedTypeMetadata): Boolean {
        val issuer = context.environment.getProperty("spring.security.oauth2.resourceserver.jwt.issuer-uri")
        return !issuer.isNullOrBlank()
    }
}
