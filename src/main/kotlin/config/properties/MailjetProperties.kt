package community.flock.eco.workday.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConfigurationProperties(prefix = "mailjet")
@ConstructorBinding
data class MailjetProperties(
    val apiKey: String,
    val apiSecretKey: String,
    val reminderTemplateId: Int,
    val updateTemplateId: Int
) {
    init {
        println(this)
    }
}
