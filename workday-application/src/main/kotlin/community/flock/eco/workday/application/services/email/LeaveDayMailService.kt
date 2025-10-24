package community.flock.eco.workday.application.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.utils.DateUtils.toHumanReadable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class LeaveDayMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
) {
    private val log: Logger = LoggerFactory.getLogger(LeaveDayMailService::class.java)

    fun sendUpdate(leaveDay: LeaveDay) {
        val recipient = leaveDay.person

        val subject = "Leave day update: ${leaveDay.from.toHumanReadable()} to ${leaveDay.to.toHumanReadable()} - ${leaveDay.description}"
        val emailMessage =
            """
            |<p>Your leave day from ${leaveDay.from.toHumanReadable()} to ${leaveDay.to.toHumanReadable()} has been updated.</p>
            |${leaveDay.html()}
            """.trimMargin()

        log.info("Email generated for LeaveDay update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            personReceiveEmail = recipient.receiveEmail,
            recipientEmail = recipient.email,
            emailSubject = subject,
            templateVariables = templateVariables,
            templateId = mailjetTemplateProperties.updateTemplateId,
        )
    }

    fun sendNotification(leaveDay: LeaveDay) {
        val employee = leaveDay.person

        val subject = "Leave day update for ${employee.firstname}"
        val emailMessage =
            """
                |<p>A leave day has been added for ${employee.firstname}.</p>
                |${leaveDay.html()}
            """.trimMargin()

        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for LeaveDay notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }

    private fun LeaveDay.html() =
        // language=html
        """
        |<div>
        |    <p>Leave day state:</p>
        |    <ul>
        |        <li>Description: $description</li>
        |        <li>Type: $type</li>
        |        <li>From: ${from.toHumanReadable()}</li>
        |        <li>Up to and including: ${to.toHumanReadable()}</li>
        |        <li>Total leave hours: $hours</li>
        |        <li>Status: $status</li>
        |    </ul>
        |</div>
        """.trimMargin()
}
