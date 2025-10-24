package community.flock.eco.workday.application.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.application.utils.DateUtils.toHumanReadable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class SickDayMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
) {
    private val log: Logger = LoggerFactory.getLogger(SickDayMailService::class.java)

    fun sendUpdate(sickDay: SickDay) {
        val recipient = sickDay.person

        val subject =
            "Sick day update: " +
                "${sickDay.from.toHumanReadable()} to ${sickDay.to.toHumanReadable()} " +
                "- ${sickDay.description ?: "no description"}"
        val emailMessage =
            """
            |<p>Your sick day from ${sickDay.from.toHumanReadable()} to ${sickDay.to.toHumanReadable()} has been updated.<p>
            |${sickDay.html()}
            """.trimMargin()

        log.info("Email generated for SickDay update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            personReceiveEmail = recipient.receiveEmail,
            recipientEmail = recipient.email,
            emailSubject = subject,
            templateVariables = templateVariables,
            templateId = mailjetTemplateProperties.updateTemplateId,
        )
    }

    fun sendNotification(sickDay: SickDay) {
        val employee = sickDay.person

        val subject = "Sick day update for ${employee.firstname}"
        val emailMessage =
            """
                |<p>A sick day has been added for ${employee.firstname}.</p>
                |${sickDay.html()}
            """.trimMargin()

        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for SickDay notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }

    private fun SickDay.html() =
        // language=html
        """
        |<div>
        |    <p>Sick day state:</p>
        |    <ul>
        |        <li>Description: $description</li>
        |        <li>From: ${from.toHumanReadable()}</li>
        |        <li>Up to and including: ${to.toHumanReadable()}</li>
        |        <li>Total absence hours: $hours</li>
        |        <li>Status: $status</li>
        |    </ul>
        |</div>
        """.trimMargin()
}
