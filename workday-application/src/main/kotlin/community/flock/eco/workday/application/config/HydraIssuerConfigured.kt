package community.flock.eco.workday.application.config

import org.springframework.context.annotation.Condition
import org.springframework.context.annotation.ConditionContext
import org.springframework.core.type.AnnotatedTypeMetadata

// Unlike @ConditionalOnProperty, a blank issuer-uri (used by the test profile to disable
// the JWT chain) does not match.
class HydraIssuerConfigured : Condition {
    override fun matches(
        context: ConditionContext,
        metadata: AnnotatedTypeMetadata,
    ): Boolean {
        val issuer = context.environment.getProperty("spring.security.oauth2.resourceserver.jwt.issuer-uri")
        return !issuer.isNullOrBlank()
    }
}
