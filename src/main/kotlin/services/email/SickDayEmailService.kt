package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.SickDay
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter

@Service
class SickDayEmailService (private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(SickDayEmailService::class.java)

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

        log.info("Email generated for SickDay update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(recipient.receiveEmail, recipient.email, subject, templateVariables,
            mailjetTemplateProperties.updateTemplateId)
    }

    fun sendNotification(sickDay: SickDay) {
        val timeDateFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy")
        val employee = sickDay.person

        val subject = "Update in SickDay."
        val emailMessage = "Er is een update van ${employee.firstname} in de SickDay aanvraag." +
            " (van: ${sickDay.from.format(timeDateFormat)} tot: ${sickDay.to.format(timeDateFormat)})."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for SickDay notification for ${employee.email}")

        emailService.sendEmailNotification(subject, templateVariables,
            mailjetTemplateProperties.notificationTemplateId)
    }
}
