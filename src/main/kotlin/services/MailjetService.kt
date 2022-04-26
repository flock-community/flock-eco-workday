package community.flock.eco.workday.services

import com.mailjet.client.MailjetRequest
import com.mailjet.client.resource.Emailv31
import community.flock.eco.workday.config.properties.MailjetProperties
import community.flock.eco.workday.config.properties.NotificationProperties
import community.flock.eco.workday.model.Person
import org.json.JSONArray
import org.json.JSONObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.stereotype.Component
import java.time.YearMonth
import java.time.format.TextStyle

@Component
class MailjetService(
    mailjetClientProvider: IMailjetClientProvider,
    private val notificationProperties: NotificationProperties,
    private val mailjetProperties: MailjetProperties
) {
    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java)

    private var client = mailjetClientProvider.client

    fun sendUpdate(person: Person, yearMonth: YearMonth) {
        log.info("Send update ${person.email}")
        val month = yearMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())
        val subject = "Workday hours are updated by ${person.firstname} for $month"

        val variables = JSONObject()
            .put("month", month)
            .put("person", person.firstname)

        val request = createMailjetRequest(
            templateId = mailjetProperties.updateTemplateId,
            subject = subject,
            variables = variables,
            recipientEmailAddress = notificationProperties.recipient
        )
        client.post(request)
    }

    fun sendReminder(person: Person, yearMonth: YearMonth) {
        log.info("Send reminder ${person.email}")
        val month = yearMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())
        val subject = "Please submit your hours for $month"
        val variables = JSONObject()
            .put("month", month)
            .put("name", person.firstname)
        val request = createMailjetRequest(
            templateId = mailjetProperties.reminderTemplateId,
            subject = subject,
            variables = variables,
            recipientName = person.getFullName(),
            recipientEmailAddress = person.email
        )
        client.post(request)
    }

    private fun createMailjetRequest(
        templateId: Int,
        recipientName: String? = null,
        recipientEmailAddress: String,
        subject: String,
        variables: JSONObject
    ): MailjetRequest? =
        MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES,
                JSONArray().put(
                    JSONObject()
                        .put(Emailv31.Message.FROM, createFrom())
                        .put(Emailv31.Message.TO, createTo(recipientName, recipientEmailAddress))
                        .put(Emailv31.Message.TEMPLATEID, templateId)
                        .put(Emailv31.Message.TEMPLATELANGUAGE, true)
                        .put(Emailv31.Message.SUBJECT, subject)
                        .put(Emailv31.Message.VARIABLES, variables)
                )
            )

    private fun createFrom() = JSONObject()
        .put("Email", "info@flock.community")
        .put("Name", "Flock.")

    private fun createTo(recipientName: String?, recipientEmailAddress: String) = JSONArray()
        .put(
            JSONObject()
                .apply {
                    recipientName?.let {
                        put("Name", recipientName)
                    }
                    put("Email", recipientEmailAddress)
                }
        )
}
