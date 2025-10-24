package community.flock.eco.workday.application.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding
import org.springframework.context.annotation.Profile

@ConfigurationProperties(prefix = "mailjet.client")
@Profile("!test & !develop")
@ConstructorBinding
data class MailjetClientProperties(
    val apiKey: String,
    val apiSecretKey: String,
)

@ConfigurationProperties(prefix = "mailjet.templates")
@ConstructorBinding
data class MailjetTemplateProperties(
    val reminderTemplateId: Int,
    val updateTemplateId: Int,
    val notificationTemplateId: Int,
)
