package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.LeaveDay
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter

@Service
class LeaveDayEmailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(LeaveDayEmailService::class.java)

    fun sendUpdate(
        old: LeaveDay,
        new: LeaveDay,
    ) {
        val recipient = new.person

        var subject = "Update in Leave Day."
        var emailMessage = "Er is een update in Leave Day."

        if (old.status !== new.status) {
            subject = "Status update in Leave Day."
            emailMessage = "De status van je Leave Day is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}."
        }

        log.info("Email generated for LeaveDay update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            recipient.receiveEmail,
            recipient.email,
            subject,
            templateVariables,
            mailjetTemplateProperties.updateTemplateId,
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
