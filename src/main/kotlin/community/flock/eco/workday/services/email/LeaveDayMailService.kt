package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.LeaveDay
import community.flock.eco.workday.utils.DateUtils.toHumanReadable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter

@Service
class LeaveDayMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties
) {
    private val log: Logger = LoggerFactory.getLogger(LeaveDayMailService::class.java)

    fun sendUpdate(leaveDay: LeaveDay) {
        val recipient = leaveDay.person

        val subject = "Leave Day update - ${leaveDay.description}"
        val emailMessage =
            """
            <p>Je verlof voor '${leaveDay.description}' is bijgewerkt.<p>

            <ul>
                <li>Omschrijving: ${leaveDay.description}</li>
                <li>Type: ${leaveDay.type}</li>
                <li>Van: ${leaveDay.from.toHumanReadable()}</li>
                <li>Tot en met: ${leaveDay.to.toHumanReadable()}</li>
                <li>Totaal aantal verlofuren: ${leaveDay.hours}</li>
                <li>Status: ${leaveDay.status}</li>
            </ul>
            """.trimIndent()

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
        val timeDateFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy")
        val employee = leaveDay.person

        val subject = "Update in Leave Day."
        val emailMessage =
            "Er is een update van ${employee.firstname} in de Leave Day aanvraag" +
                " (van: ${leaveDay.from.format(timeDateFormat)} tot: ${leaveDay.to.format(timeDateFormat)})."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for LeaveDay notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }
}
