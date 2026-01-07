package community.flock.eco.workday.application.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.utils.DateUtils.toHumanReadable
import community.flock.eco.workday.domain.Status
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.stereotype.Service
import java.time.YearMonth
import java.time.format.TextStyle

@Service
class WorkdayEmailService(
    private val emailService: EmailService,
    private val mailjetTemplateProperties: MailjetTemplateProperties,
) {
    private val log: Logger = LoggerFactory.getLogger(WorkdayEmailService::class.java)

    fun sendUpdate(workDay: WorkDay) {
        val recipient = workDay.assignment.person

        val subject =
            "Workday update: ${workDay.from.toHumanReadable()} to ${workDay.to.toHumanReadable()} at ${workDay.assignment.client.name}"
        val emailMessage =
            """
            |<p>Your workday at ${workDay.assignment.client.name} has been updated.<p>
            |${workDay.html()}
            """.trimMargin()

        log.info("Email generated for workday update to ${recipient.email}")

        val templateVariables =
            emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            personReceiveEmail = recipient.receiveEmail,
            recipientEmail = recipient.email,
            emailSubject = subject,
            templateVariables = templateVariables,
            templateId = mailjetTemplateProperties.updateTemplateId,
        )
    }

    fun sendNotification(workDay: WorkDay) {
        if (workDay.status == Status.REQUESTED) {
            val employee = workDay.assignment.person
            val month = YearMonth.from(workDay.from).month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())

            val subject = "Workday update for ${employee.firstname} (${workDay.assignment.client.name}) in $month"
            val emailMessage =
                """
                |<p>There is an update from ${employee.firstname} regarding the hours worked in $month.</p>
                |${workDay.html()}
                """.trimMargin()
            val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

            log.info("Email generated for workday notification (to notification email)")

            emailService.sendEmailNotification(
                subject,
                templateVariables,
                mailjetTemplateProperties.notificationTemplateId,
            )
        }
    }

    fun sendReminder(recipient: Person) {
        val previousMonth = YearMonth.now().minusMonths(1)
        val monthString = previousMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())

        val subject = "Please submit your hours for $monthString."
        val emailMessage =
            "We didn't receive your hours for $monthString.\n" +
                "Please submit your hours in the Workday App."
        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)

        log.info("Email generated for workday reminder to ${recipient.email}")

        emailService.sendEmailMessage(
            recipient.receiveEmail,
            recipient.email,
            subject,
            templateVariables,
            mailjetTemplateProperties.reminderTemplateId,
        )
    }

    private fun WorkDay.html() =
        // language=html
        """
        |<div>
        |    <p>Workday state</p>
        |    <ul>
        |        <li>Client: ${assignment.client.name}</li>
        |        <li>Role: ${assignment.role ?: "-"}</li>
        |        <li>Project: ${assignment.project?.name ?: "-"}</li>
        |        <li>From: ${from.toHumanReadable()}</li>
        |        <li>Up to and including: ${to.toHumanReadable()}</li>
        |        <li>Total worked hours: $hours</li>
        |        <li>Status: $status</li>
        |    </ul>
        |</div>
        """.trimMargin()
}
