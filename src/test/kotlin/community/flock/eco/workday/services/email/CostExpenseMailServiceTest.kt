package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.aPerson
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.json.JSONObject
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class CostExpenseMailServiceTest {
    private val emailService: EmailService = mockk(relaxed = true)
    private val mailjetTemplateProperties: MailjetTemplateProperties = mockk()

    private val service = CostExpenseMailService(emailService, mailjetTemplateProperties)

    @Test
    fun `Send email`() {
        val costExpense =
            CostExpense(
                id = UUID.randomUUID(),
                date = LocalDate.of(2025, 2, 13),
                description = "Aankoop ergonomische hagelslag",
                person = aPerson(),
                status = Status.REQUESTED,
                amount = 43.21,
                files = emptyList(),
            )

        val expectedEmailMessage =
            """
            <p>Je declaratie voor 'Aankoop ergonomische hagelslag' is bijgewerkt.<p>

            <ul>
                <li>Beschrijving: Aankoop ergonomische hagelslag</li>
                <li>Kosten gemaakt op: 13-02-2025</li>
                <li>Bedrag: 43.21</li>
                <li>Status: REQUESTED</li>
            </ul>
            """.trimIndent()
        val templateVariables = JSONObject()
        every {
            emailService.createTemplateVariables(
                costExpense.person.firstname,
                expectedEmailMessage,
            )
        }.returns(templateVariables)

        val templateId = 3
        every { mailjetTemplateProperties.updateTemplateId }.returns(templateId)

        service.sendUpdate(costExpense)

        verify {
            emailService.sendEmailMessage(
                costExpense.person.receiveEmail,
                costExpense.person.email,
                "Declaratie update - Aankoop ergonomische hagelslag!",
                templateVariables,
                templateId,
            )
        }
    }
}

