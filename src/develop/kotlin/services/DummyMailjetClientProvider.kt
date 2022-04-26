package community.flock.eco.workday.services

import com.mailjet.client.ClientOptions
import com.mailjet.client.MailjetClient
import com.mailjet.client.MailjetRequest
import com.mailjet.client.MailjetResponse
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class DummyMailjetClientProvider : IMailjetClientProvider {
    override val client = DummyMailjetClient()
}

class DummyMailjetClient : MailjetClient(
    ClientOptions.builder().build()
) {
    override fun delete(request: MailjetRequest?): MailjetResponse = MailjetResponse(HttpStatus.OK.value(), "{}")
    override fun get(request: MailjetRequest?): MailjetResponse = MailjetResponse(HttpStatus.OK.value(), "{}")
    override fun post(request: MailjetRequest?): MailjetResponse = MailjetResponse(HttpStatus.OK.value(), "{}")
    override fun put(request: MailjetRequest?): MailjetResponse = MailjetResponse(HttpStatus.OK.value(), "{}")
}
