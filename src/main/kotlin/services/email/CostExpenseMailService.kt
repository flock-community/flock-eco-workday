package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.CostExpense
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class CostExpenseMailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java)

    fun sendUpdate(old: CostExpense, new: CostExpense) {
        val recipient = new.person
        log.info("Send CostExpense update to ${recipient.email}")

        var subject = "Update in CostExpense!"
        var emailMessage = "Er is een update in CostExpense."

        if (old.status !== new.status) {
            subject = "Status update in CostExpense!"
            emailMessage = "De status van je CostExpense is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}."
        }

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(recipient.email, subject, templateVariables, mailjetTemplateProperties.updateTemplateId)
    }

    fun sendNotification(expense: CostExpense) {
        val employee = expense.person
        log.info("Send CostExpense notification for ${employee.email}")

        val subject = "Update in CostExpense."
        val emailMessage = "Er is een CostExpense door ${employee.firstname} toegevoegd."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        emailService.sendEmailNotification(subject, templateVariables, mailjetTemplateProperties.notificationTemplateId)
    }
}
