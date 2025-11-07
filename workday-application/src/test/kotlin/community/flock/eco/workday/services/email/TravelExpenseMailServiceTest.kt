package community.flock.eco.workday.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.TravelExpense
import community.flock.eco.workday.application.services.email.EmailService
import community.flock.eco.workday.application.services.email.TravelExpenseMailService
import community.flock.eco.workday.model.aPerson
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.json.JSONObject
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class TravelExpenseMailServiceTest {
    private val emailService: EmailService = mockk(relaxed = true)
    private val mailjetTemplateProperties: MailjetTemplateProperties = mockk()

    private val service = TravelExpenseMailService(emailService, mailjetTemplateProperties)

    @Test
    fun `Send email`() {
        val travelExpense =
            TravelExpense(
                id = UUID.randomUUID(),
                date = LocalDate.of(2025, 2, 13),
                description = "Taxirit naar hoofdkantoor Coolblue",
                person = aPerson(),
                distance = 12.34,
                allowance = 0.33,
                status = Status.REQUESTED,
            )

        val expectedEmailMessage =
            """
            <p>Your travel expense for 'Taxirit naar hoofdkantoor Coolblue' has been updated.<p>
            <div>
                <p>Travel expense state:</p>
                <ul>
                    <li>Description: Taxirit naar hoofdkantoor Coolblue</li>
                    <li>Issue date: 13-02-2025</li>
                    <li>Distance: 12.34</li>
                    <li>Allowance: 0.33</li>
                    <li>Status: REQUESTED</li>
                </ul>
            </div>
            """.trimIndent()
        val templateVariables = JSONObject()
        every {
            emailService.createTemplateVariables(
                travelExpense.person.firstname,
                expectedEmailMessage,
            )
        }.returns(templateVariables)

        val templateId = 3
        every { mailjetTemplateProperties.updateTemplateId }.returns(templateId)

        service.sendUpdate(travelExpense)

        verify {
            emailService.sendEmailMessage(
                travelExpense.person.receiveEmail,
                travelExpense.person.email,
                "Travel expense update: Taxirit naar hoofdkantoor Coolblue",
                templateVariables,
                templateId,
            )
        }
    }
}
