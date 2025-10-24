package community.flock.eco.workday.application.config.cloud

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties(prefix = "flock.eco.cloud.stub")
data class StubCloudProperties(
    val enabled: Boolean = false,
)
