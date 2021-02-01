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
import java.util.Locale

@Component
class MailjetService(
    @Value("\${mailjet.apikey}") private val apiKey: String,
    @Value("\${mailjet.apiSecretKey}") private val apiSecretKey: String,
) {

    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java)

    private var options = ClientOptions.builder()
        .apiKey(apiKey)
        .apiSecretKey(apiSecretKey)
        .build()

    private var client = MailjetClient(options)

    fun sendReminder(person: Person, yearMonth: YearMonth) {
        log.debug("Send email ${person.email}")
        val request = MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES, JSONArray()
                .put(JSONObject()
                    .put(Emailv31.Message.FROM, JSONObject()
                        .put("Email", "info@flock.community")
                        .put("Name", "Flock. hours reminder"))
                    .put(Emailv31.Message.TO, JSONArray()
                        .put(JSONObject()
                            .put("Email", person.email)
                            .put("Name", person.getFullName())))
                    .put(Emailv31.Message.TEMPLATEID, 2144556)
                    .put(Emailv31.Message.TEMPLATELANGUAGE, true)
                    .put(Emailv31.Message.SUBJECT, "Please submit your hours")
                    .put(Emailv31.Message.VARIABLES, JSONObject()
                        .put("month", yearMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale()))
                        .put("name", person.getFullName()))))
        client.post(request)

    }
}

