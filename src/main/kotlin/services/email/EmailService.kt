package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.NotificationProperties
import org.json.JSONObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class EmailService(private val emailSendService: MailjetService, private val notificationProperties: NotificationProperties) {
    private val log: Logger = LoggerFactory.getLogger(EmailService::class.java)

    fun sendEmailMessage(
        loggingString: String,
        personReceiveEmail: Boolean,
        recipientEmail: String,
        emailSubject: String,
        templateVariables: JSONObject,
        templateId: Int
    ) {
        if (!personReceiveEmail) {
            log.info("Dit not send this email because of receiveEmail setting: $loggingString");
        } else {
            log.info(loggingString);
            emailSendService.sendEmailMessage(
                EmailMessageProperties(
                    recipientEmail, emailSubject, templateVariables,
                    templateId
                )
            )
        }
    }

    fun sendEmailNotification(loggingString: String, personReceiveEmail: Boolean,emailSubject: String,
                              templateVariables: JSONObject, templateId: Int) {
        sendEmailMessage(loggingString, personReceiveEmail, notificationProperties.recipient, emailSubject,
            templateVariables, templateId)
    }

    fun createTemplateVariables(
        salutation: String,
        emailMessage: String,
        url: String = "https://workday.flock.community"
    ): JSONObject {
        return JSONObject()
            .put("recipient_salutation", salutation)
            .put("email_message", emailMessage)
            .put("workday_url", url)
    }
}

class EmailMessageProperties(recipientEmail: String, subjectLine: String, variables: JSONObject, var templateId: Int) {
    var recipientFirstName: String
    var recipientEmailAddress: String = recipientEmail
    var subject: String = subjectLine
    var templateVariables: JSONObject = variables

    init {
        recipientFirstName = "recipient"
    }
}
