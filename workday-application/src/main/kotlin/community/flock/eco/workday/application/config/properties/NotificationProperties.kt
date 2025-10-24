package community.flock.eco.workday.application.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConfigurationProperties(prefix = "workday.notifications")
@ConstructorBinding
data class NotificationProperties(
    val recipient: String,
)
