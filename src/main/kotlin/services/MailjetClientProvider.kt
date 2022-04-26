package community.flock.eco.workday.services

import com.mailjet.client.ClientOptions
import com.mailjet.client.MailjetClient
import community.flock.eco.workday.config.properties.MailjetProperties
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Service

@Service
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"], havingValue = "false")
class MailjetClientProvider(
    mailjetProperties: MailjetProperties
) : IMailjetClientProvider {
    private val options = ClientOptions.builder()
        .apiKey(mailjetProperties.apiKey)
        .apiSecretKey(mailjetProperties.apiSecretKey)
        .build()

    override val client = MailjetClient(options)
}
