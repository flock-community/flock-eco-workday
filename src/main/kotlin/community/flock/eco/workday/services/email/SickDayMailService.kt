package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.utils.DateUtils.toHumanReadable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter

@Service
class SickDayMailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
) {
    private val log: Logger = LoggerFactory.getLogger(SickDayMailService::class.java)

    fun sendUpdate(sickDay: SickDay) {
        val recipient = sickDay.person

        val subject = "SickDay update - ${sickDay.description ?: "ziek"}"
        val emailMessage =
            """
            <p>Je ziekteverzuim voor '${sickDay.description ?: "geen omschrijving"}' is bijgewerkt.<p>

            <ul>
                <li>Omschrijving: ${sickDay.description}</li>
                <li>Van: ${sickDay.from.toHumanReadable()}</li>
                <li>Tot en met: ${sickDay.to.toHumanReadable()}</li>
                <li>Total aantal verzuimuren: ${sickDay.hours}</li>
                <li>Status: ${sickDay.status}</li>
            </ul>
            """.trimIndent()

        log.info("Email generated for SickDay update for ${recipient.email}")

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            personReceiveEmail = recipient.receiveEmail,
            recipientEmail = recipient.email,
            emailSubject = subject,
            templateVariables = templateVariables,
            templateId = mailjetTemplateProperties.updateTemplateId,
        )
    }

    fun sendNotification(sickDay: SickDay) {
        val timeDateFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy")
        val employee = sickDay.person

        val subject = "Update in SickDay."
        val emailMessage =
            "Er is een update van ${employee.firstname} in de SickDay aanvraag." +
                " (van: ${sickDay.from.format(timeDateFormat)} tot: ${sickDay.to.format(timeDateFormat)})."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        log.info("Email generated for SickDay notification for ${employee.email}")

        emailService.sendEmailNotification(
            subject,
            templateVariables,
            mailjetTemplateProperties.notificationTemplateId,
        )
    }
}
