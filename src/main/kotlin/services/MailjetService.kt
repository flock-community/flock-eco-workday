package community.flock.eco.workday.services

import com.mailjet.client.ClientOptions
import com.mailjet.client.MailjetClient
import com.mailjet.client.MailjetRequest
import com.mailjet.client.resource.Emailv31
import community.flock.eco.workday.model.Person
import org.json.JSONArray
import org.json.JSONObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.stereotype.Component
import java.time.YearMonth
import java.time.format.TextStyle

@Component
class MailjetService(
    @Value("\${mailjet.apikey:}") private val apiKey: String,
    @Value("\${mailjet.apiSecretKey:}") private val apiSecretKey: String,
    private val personService: PersonService,
) {

    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java)

    private var options = ClientOptions.builder()
        .apiKey(apiKey)
        .apiSecretKey(apiSecretKey)
        .build()

    private var client = MailjetClient(options)

    fun sendUpdate(person: Person, yearMonth: YearMonth) {
        log.info("Send update ${person.email}")
        val month = yearMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())
        val subject = "Workday hours are updated by ${person.firstname} for $month"
        personService.findByUpdatesTrue()
            .forEach {
                val variables = JSONObject()
                    .put("name", it.firstname)
                    .put("month", month)
                    .put("person", person.firstname)
                val request = createMailjetRequest(2626040, it, subject, variables)
                client.post(request)
            }
    }

    fun sendReminder(person: Person, yearMonth: YearMonth) {
        log.info("Send reminder ${person.email}")
        val month = yearMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())
        val subject = "Please submit your hours for $month"
        val variables = JSONObject()
            .put("month", month)
            .put("name", person.firstname)
        val request = createMailjetRequest(2144556, person, subject, variables)
        client.post(request)
    }

    private fun createMailjetRequest(templateId: Int, person: Person, subject: String, variables: JSONObject): MailjetRequest? {
        val request = MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES,
                JSONArray()
                    .put(
                        JSONObject()
                            .put(
                                Emailv31.Message.FROM,
                                JSONObject()
                                    .put("Email", "info@flock.community")
                                    .put("Name", "Flock.")
                            )
                            .put(
                                Emailv31.Message.TO,
                                JSONArray()
                                    .put(
                                        JSONObject()
                                            .put("Email", person.email)
                                            .put("Name", person.getFullName())
                                    )
                            )
                            .put(Emailv31.Message.TEMPLATEID, templateId)
                            .put(Emailv31.Message.TEMPLATELANGUAGE, true)
                            .put(Emailv31.Message.SUBJECT, subject)
                            .put(Emailv31.Message.VARIABLES, variables)
                    )
            )
        return request
    }
}
