package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.TravelExpense
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class TravelExpenseMailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java)

    fun sendUpdate(old: TravelExpense, new: TravelExpense) {
        val recipient = new.person
        if (!recipient.receiveEmail) {
            log.info("Should send TravelExpense update to ${recipient.email}. But person does not receive emails.")
            return;
        }
        log.info("Send TravelExpense update to ${recipient.email}")

        var subject = "Update in TravelExpense."
        var emailMessage = "Er is een update in TravelExpense."

        if (old.status !== new.status) {
            subject = "Status update in TravelExpense!"
            emailMessage = "De status van je TravelExpense is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}."
        }

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(recipient.email, subject, templateVariables, mailjetTemplateProperties.updateTemplateId)
    }

    fun sendNotification(expense: TravelExpense) {
        val employee = expense.person
        if (!employee.receiveEmail) {
            log.info("Should send TravelExpense notification for ${employee.email}. But person does not receive emails.")
            return;
        }
        log.info("Send TravelExpense notification for ${employee.email}")

        val subject = "Update in TravelExpense."
        val emailMessage = "Er is een TravelExpense door ${employee.firstname} toegevoegd."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        emailService.sendEmailNotification(subject, templateVariables, mailjetTemplateProperties.notificationTemplateId)
    }
}
