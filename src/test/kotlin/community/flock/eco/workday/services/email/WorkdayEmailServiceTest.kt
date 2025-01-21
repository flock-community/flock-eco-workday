package community.flock.eco.workday.services.email

import community.flock.eco.workday.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.model.aWorkDaySheet
import community.flock.eco.workday.model.anAssignment
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.json.JSONObject
import org.junit.jupiter.api.Test
import java.time.LocalDate

class WorkdayEmailServiceTest {
    private val emailService: EmailService = mockk(relaxed = true)
    private val mailjetTemplateProperties: MailjetTemplateProperties = mockk()

    private val service = WorkdayEmailService(emailService, mailjetTemplateProperties)

    @Test
    fun `Send email`() {
        val workDay =
            WorkDay(
                5,
                hours = 40.0,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 1, 31),
                assignment = anAssignment(),
                status = Status.REQUESTED,
                sheets =
                    listOf(
                        aWorkDaySheet(),
                    ),
            )

        val expectedEmailMessage =
            """
            <p>Je workday bij DHL is bijgewerkt.<p>

            <ul>
                <li>Klant: DHL</li>
                <li>Rol: -</li>
                <li>Project: -</li>
                <li>Van: 01-01-2024</li>
                <li>Tot en met: 31-01-2024</li>
                <li>Totaal aantal gewerkte uren: 40.0</li>
                <li>Status: REQUESTED</li>
            </ul>
            """.trimIndent()
        val templateVariables = JSONObject()
        every {
            emailService.createTemplateVariables(
                workDay.assignment.person.firstname,
                expectedEmailMessage,
            )
        }.returns(templateVariables)

        val templateId = 3
        every { mailjetTemplateProperties.updateTemplateId }.returns(templateId)

        service.sendUpdate(workDay)

        verify {
            emailService.sendEmailMessage(
                workDay.assignment.person.receiveEmail,
                workDay.assignment.person.email,
                "Workday update (01-01-2024 t/m 31-01-2024 bij DHL)",
                templateVariables,
                templateId,
            )
        }
    }
}
