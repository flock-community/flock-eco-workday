package community.flock.eco.workday.application.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "workday.notifications")
data class NotificationProperties(
    val recipient: String,
)
