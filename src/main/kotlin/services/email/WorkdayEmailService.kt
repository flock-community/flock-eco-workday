package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import org.json.JSONObject
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.i18n.LocaleContextHolder
import java.time.YearMonth
import java.time.format.TextStyle

class WorkdayEmailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java);

    fun sendUpdate(old: WorkDayForm, new: WorkDay) {
        val recipient = new.assignment.person;
        log.info("Send workday update to ${recipient.email}");

        var subject = "Update in Workday.";
        var emailMessage = "Er is een update in Workday.";

        if (old.status !== new.status) {
            subject = "Status update in Workday!";
            emailMessage = "De status van je Workday is veranderd.\n\n" +
                "Vorige status: ${old.status}.\n" +
                "Nieuwe status: ${new.status}.";
        }

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage);
        emailService.sendEmailMessage(recipient.email, subject, templateVariables, mailjetTemplateProperties.updateTemplateId);
    }

    fun sendNotification(workDay: WorkDay) {
        if (workDay.status == Status.REQUESTED) {
            val employee = workDay.assignment.person;
            val month = YearMonth.from(workDay.from).month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale());
            log.info("Send workday notification for ${employee.email}");

            val subject = "Update in Workday."
            val emailMessage = "Er is een update van ${employee.firstname} in uren van ${month}.";
            val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage);

            emailService.sendEmailNotification(subject, templateVariables, mailjetTemplateProperties.notificationTemplateId);
        }
    }

    fun sendReminder(recipient: Person) {
        val previousMonth = YearMonth.now().minusMonths(1);
        val monthString = previousMonth.month.getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale());
        log.info("Send workday reminder to ${recipient.email}");

        val subject = "Please submit your hours for ${monthString}.";
        val emailMessage = "We didn't receive your hours for ${monthString}.\n" +
            "Please submit your hours in the Workday App.";
        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage);

        emailService.sendEmailMessage(recipient.email, subject, templateVariables, mailjetTemplateProperties.reminderTemplateId);
    }
}
