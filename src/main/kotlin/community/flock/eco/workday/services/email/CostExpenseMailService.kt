package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.utils.DateUtils.toHumanReadable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class CostExpenseMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties
) {
    private val log: Logger = LoggerFactory.getLogger(CostExpenseMailService::class.java)

    fun sendUpdate(
        expense: CostExpense,
    ) {
        val recipient = expense.person

        val subject = "Declaratie update - ${expense.description ?: "beschrijving onbekend"}!"
        val emailMessage =
            """
            <p>Je declaratie voor '${expense.description ?: "onbekend"}' is bijgewerkt.<p>

            <ul>
                <li>Beschrijving: ${expense.description}</li>
                <li>Kosten gemaakt op: ${expense.date.toHumanReadable()}</li>
                <li>Bedrag: ${expense.amount}</li>
                <li>Status: ${expense.status}</li>
            </ul>
            """.trimIndent()
        log.info("Email generated for CostExpense update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            personReceiveEmail = recipient.receiveEmail,
            recipientEmail = recipient.email,
            emailSubject = subject,
            templateVariables = templateVariables,
            templateId = mailjetTemplateProperties.updateTemplateId,
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
