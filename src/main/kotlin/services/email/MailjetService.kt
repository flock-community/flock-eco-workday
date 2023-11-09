package community.flock.eco.workday.services.email

import com.mailjet.client.MailjetClient
import com.mailjet.client.MailjetRequest
import com.mailjet.client.resource.Emailv31
import community.flock.eco.workday.config.properties.MailjetTemplateProperties
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
    private val notificationProperties: NotificationProperties,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
    private val client: MailjetClient
) {
    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java)

    fun sendUpdate(person: Person, yearMonth: YearMonth) {
        log.info("Send update ${person.email}")
        val month = yearMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())
        val subject = "Workday hours are updated by ${person.firstname} for $month"

        val variables = JSONObject()
            .put("month", month)
            .put("person", person.firstname)

        val request = createMailjetRequest(
            templateId = mailjetTemplateProperties.updateTemplateId,
            subject = subject,
            variables = variables,
            recipientEmailAddress = notificationProperties.recipient
        )
        try {
            client.post(request)
        } catch (ex: Exception) {
            log.error("Cannot send mail to mailjet", ex)
        }
    }

    fun sendReminder(person: Person, yearMonth: YearMonth) {
        log.info("Send reminder ${person.email}")
        val month = yearMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())
        val subject = "Please submit your hours for $month"
        val variables = JSONObject()
            .put("month", month)
            .put("name", person.firstname)
        val request = createMailjetRequest(
            templateId = mailjetTemplateProperties.reminderTemplateId,
            subject = subject,
            variables = variables,
            recipientName = person.getFullName(),
            recipientEmailAddress = person.email
        )
        try {
            client.post(request)
        } catch (ex: Exception) {
            log.error("Cannot send mail to mailjet", ex)
        }
    }

    fun sendEmailMessage(requestProperties: EmailMessageProperties) {
        log.info("Send email message to ${requestProperties.recipientEmailAddress}")
        val request = createMailjetRequest(
            recipientName = requestProperties.recipientFirstName,
            recipientEmailAddress = requestProperties.recipientEmailAddress,
            templateId = requestProperties.templateId,
            subject = requestProperties.subject,
            variables = requestProperties.templateVariables,
        )
        try {
            client.post(request)
        } catch (ex: Exception) {
            log.error("Cannot send mail to mailjet:", ex)
        }
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
