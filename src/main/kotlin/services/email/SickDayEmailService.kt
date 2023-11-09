package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.SickDay
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter

@Service
class SickDayEmailService (private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {

    fun sendUpdate(old: SickDay, new: SickDay) {
        val recipient = new.person

        var subject = "Update in SickDay."
        var emailMessage = "Er is een update in SickDay."

        if (old.status !== new.status) {
            subject = "Status update in SickDay!"
            emailMessage = "De status van je SickDay is veranderd.\n\n" +
                "Vorige status: ${old.status}.\n" +
                "Nieuwe status: ${new.status}."
        }

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage("Send SickDay update to ${recipient.email}", recipient.receiveEmail,
            recipient.email, subject, templateVariables, mailjetTemplateProperties.updateTemplateId)
    }

    fun sendNotification(sickDay: SickDay) {
        val timeDateFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy")
        val employee = sickDay.person

        val subject = "Update in SickDay."
        val emailMessage = "Er is een update van ${employee.firstname} in de SickDay aanvraag." +
            " (van: ${sickDay.from.format(timeDateFormat)} tot: ${sickDay.to.format(timeDateFormat)})."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        emailService.sendEmailNotification("Send SickDay notification for ${employee.email}",
            employee.receiveEmail, subject, templateVariables, mailjetTemplateProperties.notificationTemplateId)
    }
}
