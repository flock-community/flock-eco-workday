package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.LeaveDay
import community.flock.eco.workday.model.LeaveDayType
import community.flock.eco.workday.model.Status
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
                days = emptyList(),
                type = LeaveDayType.UNPAID_PARENTAL_LEAVE,
            )

        val expectedEmailMessage =
            """
            <p>Je verlof voor 'Papadagen voor de win' is bijgewerkt.<p>

            <ul>
                <li>Omschrijving: Papadagen voor de win</li>
                <li>Type: UNPAID_PARENTAL_LEAVE</li>
                <li>Van: 12-09-2028</li>
                <li>Tot en met: 02-10-2028</li>
                <li>Totaal aantal verlofuren: 66.6</li>
                <li>Status: REQUESTED</li>
            </ul>
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
                "Leave Day update - Papadagen voor de win",
                templateVariables,
                templateId,
            )
        }
    }
}
