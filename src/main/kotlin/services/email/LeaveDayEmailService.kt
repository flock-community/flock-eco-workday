package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.LeaveDay
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter

@Service
class LeaveDayEmailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {

    fun sendUpdate(old: LeaveDay, new: LeaveDay) {
        val recipient = new.person

        var subject = "Update in Leave Day."
        var emailMessage = "Er is een update in Leave Day."

        if (old.status !== new.status) {
            subject = "Status update in Leave Day."
            emailMessage = "De status van je Leave Day is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}."
        }

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage("Send leave day update to ${recipient.email}", recipient.receiveEmail,
            recipient.email, subject, templateVariables, mailjetTemplateProperties.updateTemplateId)
    }

    fun sendNotification(leaveDay: LeaveDay) {
        val timeDateFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy")
        val employee = leaveDay.person

        val subject = "Update in Leave Day."
        val emailMessage = "Er is een update van ${employee.firstname} in de Leave Day aanvraag" +
            " (van: ${leaveDay.from.format(timeDateFormat)} tot: ${leaveDay.to.format(timeDateFormat)})."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        emailService.sendEmailNotification("Send Leave Day notification for ${employee.email}",
            employee.receiveEmail, subject, templateVariables, mailjetTemplateProperties.notificationTemplateId)
    }
}
