package community.flock.eco.workday.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.application.services.email.EmailService
import community.flock.eco.workday.application.services.email.SickDayMailService
import community.flock.eco.workday.domain.common.Status
import community.flock.eco.workday.model.aPerson
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.json.JSONObject
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class SickDayMailServiceTest {
    private val emailService: EmailService = mockk(relaxed = true)
    private val mailjetTemplateProperties: MailjetTemplateProperties = mockk()

    private val service = SickDayMailService(emailService, mailjetTemplateProperties)

    @Test
    fun `Send email`() {
        val sickDay =
            SickDay(
                id = 42L,
                description = "Ziek, zwak en misselijk",
                person = aPerson(),
                status = Status.REQUESTED,
                code = UUID.randomUUID().toString(),
                from = LocalDate.of(2025, 2, 13),
                to = LocalDate.of(2025, 2, 13),
                hours = 12.0,
                days = mutableListOf(),
            )

        val expectedEmailMessage =
            """
            <p>Your sick day from 13-02-2025 to 13-02-2025 has been updated.<p>
            <div>
                <p>Sick day state:</p>
                <ul>
                    <li>Description: Ziek, zwak en misselijk</li>
                    <li>From: 13-02-2025</li>
                    <li>Up to and including: 13-02-2025</li>
                    <li>Total absence hours: 12.0</li>
                    <li>Status: REQUESTED</li>
                </ul>
            </div>
            """.trimIndent()

        val templateVariables = JSONObject()
        every {
            emailService.createTemplateVariables(
                sickDay.person.firstname,
                expectedEmailMessage,
            )
        }.returns(templateVariables)

        val templateId = 3
        every { mailjetTemplateProperties.updateTemplateId }.returns(templateId)

        service.sendUpdate(sickDay)

        verify {
            emailService.sendEmailMessage(
                sickDay.person.receiveEmail,
                sickDay.person.email,
                "Sick day update: 13-02-2025 to 13-02-2025 - Ziek, zwak en misselijk",
                templateVariables,
                templateId,
            )
        }
    }
}
