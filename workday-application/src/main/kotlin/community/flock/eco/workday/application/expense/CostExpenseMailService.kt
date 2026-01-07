package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.services.email.EmailService
import community.flock.eco.workday.application.utils.DateUtils.toHumanReadable
import community.flock.eco.workday.domain.expense.CostExpenseMailPort
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class CostExpenseMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
) : CostExpenseMailPort {
    private val log: Logger = LoggerFactory.getLogger(CostExpenseMailService::class.java)

    override fun sendUpdate(costExpense: community.flock.eco.workday.domain.expense.CostExpense) {
        sendUpdate(costExpense.toEntity())
    }

    fun sendUpdate(expense: CostExpense) {
        val recipient = expense.person

        val subject = "Cost expense update: ${expense.description ?: "description unknown"}"
        val emailMessage =
            """
            |<p>Your cost expense for '${expense.description ?: "unknown"}' has been updated.<p>
            |${expense.html()}
            """.trimMargin()

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

    override fun sendNotification(costExpense: community.flock.eco.workday.domain.expense.CostExpense) {
        sendNotification(costExpense.toEntity())
    }

    fun sendNotification(expense: CostExpense) {
        val employee = expense.person

        val subject = "Cost expense update for ${employee.firstname}"
        val emailMessage =
            """
            |<p>A cost expense has been added for ${employee.firstname}.</p>
            |${expense.html()}
            """.trimMargin()

        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for CostExpense notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }

    private fun CostExpense.html() =
        // language=html
        """
        |<div>
        |    <p>Cost expense state:</p>
        |    <ul>
        |        <li>Description: $description</li>
        |        <li>Incurred on: ${date.toHumanReadable()}</li>
        |        <li>Amount: €$amount</li>
        |        <li>Status: $status</li>
        |    </ul>
        |</div>
        """.trimMargin()
}
