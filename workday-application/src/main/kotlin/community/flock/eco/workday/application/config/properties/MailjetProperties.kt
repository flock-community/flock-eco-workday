package community.flock.eco.workday.application.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Profile

@ConfigurationProperties(prefix = "mailjet.client")
@Profile("!test & !develop")
data class MailjetClientProperties(
    val apiKey: String,
    val apiSecretKey: String,
)

@ConfigurationProperties(prefix = "mailjet.templates")
data class MailjetTemplateProperties(
    val reminderTemplateId: Int,
    val updateTemplateId: Int,
    val notificationTemplateId: Int,
)
