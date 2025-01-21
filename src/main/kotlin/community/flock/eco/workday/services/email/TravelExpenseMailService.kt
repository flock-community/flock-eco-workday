package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.utils.DateUtils.toHumanReadable
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

        val subject = "Reiskostenvergoeding update - ${expense.description ?: "beschrijving onbekend"}!"
        val emailMessage =
            """
            <p>Je reiskostenvergoeding voor '${expense.description ?: "onbekend"}' is bijgewerkt.<p>

            <ul>
                <li>Beschrijving: ${expense.description}</li>
                <li>Datum van uitgifte: ${expense.date.toHumanReadable()}</li>
                <li>Afstand: ${expense.distance}</li>
                <li>Kilometervergoeding: ${expense.allowance}</li>
                <li>Status: ${expense.status}</li>
            </ul>
            """.trimIndent()

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

        val subject = "Update in TravelExpense."
        val emailMessage = "Er is een TravelExpense door ${employee.firstname} toegevoegd."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for TravelExpense notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }
}
