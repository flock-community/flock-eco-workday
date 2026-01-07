package community.flock.eco.workday.services.email

import community.flock.eco.workday.application.config.properties.MailjetTemplateProperties
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.services.email.EmailService
import community.flock.eco.workday.application.services.email.WorkdayEmailService
import community.flock.eco.workday.domain.common.Status
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

    private val aWorkday =
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

    @Test
    fun `Send email`() {
        val workDay = aWorkday

        val expectedEmailMessage =
            """
            <p>Your workday at DHL has been updated.<p>
            <div>
                <p>Workday state</p>
                <ul>
                    <li>Client: DHL</li>
                    <li>Role: -</li>
                    <li>Project: -</li>
                    <li>From: 01-01-2024</li>
                    <li>Up to and including: 31-01-2024</li>
                    <li>Total worked hours: 40.0</li>
                    <li>Status: REQUESTED</li>
                </ul>
            </div>
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
                "Workday update: 01-01-2024 to 31-01-2024 at DHL",
                templateVariables,
                templateId,
            )
        }
    }

    @Test
    fun `Send notification`() {
        val workDay = aWorkday
        val expectedEmailMessage =
            """
            <p>There is an update from Henk regarding the hours worked in January.</p>
            <div>
                <p>Workday state</p>
                <ul>
                    <li>Client: DHL</li>
                    <li>Role: -</li>
                    <li>Project: -</li>
                    <li>From: 01-01-2024</li>
                    <li>Up to and including: 31-01-2024</li>
                    <li>Total worked hours: 40.0</li>
                    <li>Status: REQUESTED</li>
                </ul>
            </div>
            """.trimIndent()
        val templateVariables = JSONObject()
        every {
            emailService.createTemplateVariables(
                workDay.assignment.person.firstname,
                expectedEmailMessage,
            )
        }.returns(templateVariables)

        val templateId = 3
        every { mailjetTemplateProperties.notificationTemplateId }.returns(templateId)

        service.sendNotification(workDay)

        verify {
            emailService.sendEmailNotification(
                "Workday update for Henk (DHL) in January",
                templateVariables,
                templateId,
            )
        }
    }
}
