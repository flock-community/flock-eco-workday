package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.services.email.EmailService
import community.flock.eco.workday.application.utils.DateUtils.toHumanReadable
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.expense.TravelExpenseMailPort
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class TravelExpenseMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
) : TravelExpenseMailPort {
    private val log: Logger = LoggerFactory.getLogger(TravelExpenseMailService::class.java)

    override fun sendUpdate(travelExpense: TravelExpense) {
        val recipient = travelExpense.person

        val subject = "Travel expense update: ${travelExpense.description ?: "description unknown"}"
        val emailMessage =
            """
            |<p>Your travel expense for '${travelExpense.description ?: "unknown"}' has been updated.<p>
            |${travelExpense.html()}
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

    override fun sendNotification(travelExpense: TravelExpense) {
        val employee = travelExpense.person

        val subject = "Travel expense update for ${employee.firstname}"
        val emailMessage =
            """
            |<p>A travel expense has been added for ${employee.firstname}.</p>
            |${travelExpense.html()}
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
