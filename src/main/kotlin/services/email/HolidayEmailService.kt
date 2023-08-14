package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.model.HoliDay
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.format.DateTimeFormatter

class HolidayEmailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {
    private val log: Logger = LoggerFactory.getLogger(MailjetService::class.java)

    fun sendUpdate(old: HoliDayForm, new: HoliDay) {
        val recipient = new.person;
        log.info("Send holiday update to ${recipient.email}");

        var subject = "Update in Holiday.";
        var emailMessage = "Er is een update in Holiday.";

        if (old.status !== new.status) {
            subject = "Status update in Holiday.";
            emailMessage = "De status van je Holiday is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}.";
        }

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage);
        emailService.sendEmailMessage(recipient.email, subject, templateVariables, mailjetTemplateProperties.updateTemplateId);
    }

    fun sendNotification(holiDay: HoliDay) {
        val timeDateFormat = DateTimeFormatter.ofPattern("dd/mm/yyyy");
        val employee = holiDay.person;
        log.info("Send Holiday notification for ${employee.email}");

        val subject = "Update in Holiday."
        val emailMessage = "Er is een update van ${employee.firstname} in de Holiday aanvraag" +
            " (van: ${holiDay.from.format(timeDateFormat)} tot: ${holiDay.to.format(timeDateFormat)})."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage);

        emailService.sendEmailNotification(subject, templateVariables, mailjetTemplateProperties.notificationTemplateId);
    }
}
