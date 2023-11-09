package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.TravelExpense
import org.springframework.stereotype.Service

@Service
class TravelExpenseMailService(private val emailService: EmailService, private val mailjetTemplateProperties: MailjetTemplateProperties) {

    fun sendUpdate(old: TravelExpense, new: TravelExpense) {
        val recipient = new.person

        var subject = "Update in TravelExpense."
        var emailMessage = "Er is een update in TravelExpense."

        if (old.status !== new.status) {
            subject = "Status update in TravelExpense!"
            emailMessage = "De status van je TravelExpense is veranderd.\n\n" +
                "vorige status: ${old.status}.\n" +
                "nieuwe status: ${new.status}."
        }

        val templateVariables = emailService.createTemplateVariables(recipient.firstname, emailMessage)
        emailService.sendEmailMessage("Send TravelExpense update to ${recipient.email}", recipient.receiveEmail,
            recipient.email, subject, templateVariables, mailjetTemplateProperties.updateTemplateId)
    }

    fun sendNotification(expense: TravelExpense) {
        val employee = expense.person

        val subject = "Update in TravelExpense."
        val emailMessage = "Er is een TravelExpense door ${employee.firstname} toegevoegd."
        val templateVariables = emailService.createTemplateVariables(employee.firstname, emailMessage)

        emailService.sendEmailNotification("Send TravelExpense notification for ${employee.email}",
            employee.receiveEmail, subject, templateVariables, mailjetTemplateProperties.notificationTemplateId)
    }
}
