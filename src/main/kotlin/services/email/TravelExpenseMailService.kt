package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.TravelExpense
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class TravelExpenseMailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(TravelExpenseMailService::class.java)

    fun sendUpdate(old: TravelExpense, new: TravelExpense) {
        val recipient = new.person

        var subject = "Update in TravelExpense."
        var emailMessage = "Er is een update in TravelExpense."

        if (old.status !== new.status) {
            subject = "Status update in TravelExpense!"
            emailMessage = "De status van je TravelExpense is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}."
        }

        log.info("Email generated for TravelExpense update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            recipient.receiveEmail, recipient.email, subject, templateVariables,
            mailjetTemplateProperties.updateTemplateId
        )
    }

    fun sendNotification(expense: TravelExpense) {
        val employee = expense.person

        val subject = "Update in TravelExpense."
        val emailMessage = "Er is een TravelExpense door ${employee.firstname} toegevoegd."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for TravelExpense notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject, templateVariables,
            mailjetTemplateProperties.notificationTemplateId
        )
    }
}
