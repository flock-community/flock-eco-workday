package community.flock.eco.workday.services

import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.repository.WorkDayRepository
import community.flock.eco.workday.application.services.AssignmentService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.application.services.email.WorkdayEmailService
import community.flock.eco.workday.forms.aWorkDayForm
import community.flock.eco.workday.model.aWorkDay
import community.flock.eco.workday.model.anAssignment
import io.mockk.Called
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.util.Optional

private const val BUCKET_NAME = "some-bucket-name"

class WorkDayServiceTest {
    private val workDayRepository: WorkDayRepository = mockk()
    private val assignmentService: AssignmentService = mockk()
    private val emailService: WorkdayEmailService = mockk()
    private val entityManager: EntityManager = mockk()

    private val service =
        WorkDayService(
            workDayRepository,
            assignmentService,
            entityManager,
            emailService,
            BUCKET_NAME,
        )

    @Nested
    inner class Notifications {
        private val assignment: Assignment = anAssignment()
        private val workDay: WorkDay = aWorkDay(assignment)
        private val form = aWorkDayForm()
        private val workDayCode = workDay.code

        @BeforeEach
        fun beforeEach() {
            every { workDayRepository.findByCode(workDayCode) } returns Optional.of(workDay)
            every { assignmentService.findByCode(form.assignmentCode) } returns assignment
            every { workDayRepository.save(workDay) } returns workDay
            every { emailService.sendUpdate(workDay) } returns Unit
        }

        @Test
        fun `Do not send notification when updating own work day`() {
            service.update(workDayCode, form, true)
            verify { emailService wasNot Called }
        }

        @Test
        fun `Send notification when updating someone else's work day`() {
            service.update(workDayCode, form, false)
            verify { emailService.sendUpdate(workDay) }
        }
    }
}
