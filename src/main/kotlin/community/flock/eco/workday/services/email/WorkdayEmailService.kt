package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.utils.DateUtils.toHumanReadable
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
            "Workday update (${workDay.from.toHumanReadable()} t/m ${workDay.to.toHumanReadable()} bij ${workDay.assignment.client.name})"

        val project = workDay.assignment.project?.name?.replaceFirstChar { it.uppercase() } ?: "-"

        val emailMessage =
            """
            Je workday is bijgewerkt.

            Klant: ${workDay.assignment.client.name}
            Rol: ${workDay.assignment.role ?: "-"}
            Project: $project

            Van: ${workDay.from.toHumanReadable()}
            Tot en met: ${workDay.to.toHumanReadable()}

            Totaal aantal gewerkte uren: ${workDay.hours}

            Status: ${workDay.status}
            """.trimIndent()

        log.info("Email generated for workday update for ${recipient.email}")

        val templateVariables =
            emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage(
            recipient.receiveEmail,
            recipient.email,
            subject,
            templateVariables,
            mailjetTemplateProperties.updateTemplateId,
        )
    }

    fun sendNotification(workDay: WorkDay) {
        if (workDay.status == Status.REQUESTED) {
            val employee = workDay.assignment.person
            val month = YearMonth.from(workDay.from).month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale())

            val subject = "Update in Workday."
            val emailMessage = "Er is een update van ${employee.firstname} in uren van $month."
            val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

            log.info("Email generated for workday notification for ${employee.email}")

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

        log.info("Email generated for workday reminder for ${recipient.email}")

        emailService.sendEmailMessage(
            recipient.receiveEmail,
            recipient.email,
            subject,
            templateVariables,
            mailjetTemplateProperties.reminderTemplateId,
        )
    }
}
