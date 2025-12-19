package community.flock.eco.workday.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.services.email.EmailService
import community.flock.eco.workday.application.services.email.LeaveDayMailService
import community.flock.eco.workday.model.aPerson
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.json.JSONObject
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class LeaveDayMailServiceTest {
    private val emailService: EmailService = mockk(relaxed = true)
    private val mailjetTemplateProperties: MailjetTemplateProperties = mockk()

    private val service = LeaveDayMailService(emailService, mailjetTemplateProperties)

    @Test
    fun `Send email`() {
        val leaveDay =
            LeaveDay(
                id = 42L,
                description = "Papadagen voor de win",
                person = aPerson(),
                status = Status.REQUESTED,
                code = UUID.randomUUID().toString(),
                from = LocalDate.of(2028, 9, 12),
                to = LocalDate.of(2028, 10, 2),
                hours = 66.6,
                days = mutableListOf(),
                type = LeaveDayType.UNPAID_PARENTAL_LEAVE,
            )

        val expectedEmailMessage =
            """
            <p>Your leave day from 12-09-2028 to 02-10-2028 has been updated.</p>
            <div>
                <p>Leave day state:</p>
                <ul>
                    <li>Description: Papadagen voor de win</li>
                    <li>Type: UNPAID_PARENTAL_LEAVE</li>
                    <li>From: 12-09-2028</li>
                    <li>Up to and including: 02-10-2028</li>
                    <li>Total leave hours: 66.6</li>
                    <li>Status: REQUESTED</li>
                </ul>
            </div>
            """.trimIndent()
        val templateVariables = JSONObject()
        every {
            emailService.createTemplateVariables(
                leaveDay.person.firstname,
                expectedEmailMessage,
            )
        }.returns(templateVariables)

        val templateId = 3
        every { mailjetTemplateProperties.updateTemplateId }.returns(templateId)

        service.sendUpdate(leaveDay)

        verify {
            emailService.sendEmailMessage(
                leaveDay.person.receiveEmail,
                leaveDay.person.email,
                "Leave day update: 12-09-2028 to 02-10-2028 - Papadagen voor de win",
                templateVariables,
                templateId,
            )
        }
    }
}
