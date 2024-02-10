package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.CostExpense
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class CostExpenseMailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(CostExpenseMailService::class.java)

    fun sendUpdate(
        old: CostExpense,
        new: CostExpense,
    ) {
        val recipient = new.person

        var subject = "Update in CostExpense!"
        var emailMessage = "Er is een update in CostExpense."

        if (old.status !== new.status) {
            subject = "Status update in CostExpense!"
            emailMessage = "De status van je CostExpense is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}."
        }

        log.info("Email generated for CostExpense update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            recipient.receiveEmail,
            recipient.email,
            subject,
            templateVariables,
            mailjetTemplateProperties.updateTemplateId,
        )
    }

    fun sendNotification(expense: CostExpense) {
        val employee = expense.person

        val subject = "Update in CostExpense."
        val emailMessage = "Er is een CostExpense door ${employee.firstname} toegevoegd."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for CostExpense notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }
}
