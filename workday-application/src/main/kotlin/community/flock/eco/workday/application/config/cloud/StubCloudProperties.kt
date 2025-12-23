package community.flock.eco.workday.application.config.cloud

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "flock.eco.cloud.stub")
data class StubCloudProperties(
    val enabled: Boolean = false,
)
