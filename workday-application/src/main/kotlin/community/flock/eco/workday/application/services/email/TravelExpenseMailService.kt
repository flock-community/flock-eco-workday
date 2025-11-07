package community.flock.eco.workday.application.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.TravelExpense
import community.flock.eco.workday.application.utils.DateUtils.toHumanReadable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class TravelExpenseMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
) {
    private val log: Logger = LoggerFactory.getLogger(TravelExpenseMailService::class.java)

    fun sendUpdate(expense: TravelExpense) {
        val recipient = expense.person

        val subject = "Travel expense update: ${expense.description ?: "description unknown"}"
        val emailMessage =
            """
            |<p>Your travel expense for '${expense.description ?: "unknown"}' has been updated.<p>
            |${expense.html()}
            """.trimMargin()

        log.info("Email generated for TravelExpense update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            personReceiveEmail = recipient.receiveEmail,
            recipientEmail = recipient.email,
            emailSubject = subject,
            templateVariables = templateVariables,
            templateId = mailjetTemplateProperties.updateTemplateId,
        )
    }

    fun sendNotification(expense: TravelExpense) {
        val employee = expense.person

        val subject = "Travel expense update for ${employee.firstname}"
        val emailMessage =
            """
            |<p>A travel expense has been added for ${employee.firstname}.</p>
            |${expense.html()}
            """.trimMargin()
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for TravelExpense notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }

    private fun TravelExpense.html() =
        // language=html
        """
        |<div>
        |    <p>Travel expense state:</p>
        |    <ul>
        |        <li>Description: $description</li>
        |        <li>Issue date: ${date.toHumanReadable()}</li>
        |        <li>Distance: $distance</li>
        |        <li>Allowance: $allowance</li>
        |        <li>Status: $status</li>
        |    </ul>
        |</div>
        """.trimMargin()
}
