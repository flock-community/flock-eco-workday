package community.flock.eco.workday.config

import com.mailjet.client.ClientOptions
import com.mailjet.client.MailjetClient
import com.mailjet.client.MailjetRequest
import com.mailjet.client.MailjetResponse
import community.flock.eco.workday.config.properties.MailjetClientProperties
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus

@Configuration
class MailjetClientConfig {
    @Bean
    @Profile("!test & !develop")
    fun mailjetClient(mailjetClientProperties: MailjetClientProperties) =
        MailjetClient(
            ClientOptions.builder()
                .apiKey(mailjetClientProperties.apiKey)
                .apiSecretKey(mailjetClientProperties.apiSecretKey)
                .build(),
        )

    @Bean
    @Profile("test", "develop")
    fun dummyMailjetClient(): MailjetClient = DummyMailjetClient()
}

class DummyMailjetClient : MailjetClient(
    ClientOptions.builder().build(),
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    override fun delete(request: MailjetRequest?): MailjetResponse =
        MailjetResponse(HttpStatus.OK.value(), "{}")
            .also { logRequest(request, HttpMethod.DELETE) }

    override fun get(request: MailjetRequest?): MailjetResponse =
        MailjetResponse(HttpStatus.OK.value(), "{}")
            .also { logRequest(request, HttpMethod.GET) }

    override fun post(request: MailjetRequest?): MailjetResponse =
        MailjetResponse(HttpStatus.OK.value(), "{}")
            .also { logRequest(request, HttpMethod.POST) }

    override fun put(request: MailjetRequest?): MailjetResponse =
        MailjetResponse(HttpStatus.OK.value(), "{}")
            .also { logRequest(request, HttpMethod.PUT) }

    fun logRequest(
        request: MailjetRequest?,
        method: HttpMethod,
    ) = logger.debug("Received {}, request = {}", method, request)
}
