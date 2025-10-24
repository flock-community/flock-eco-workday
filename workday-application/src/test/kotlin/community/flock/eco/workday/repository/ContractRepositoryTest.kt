package community.flock.eco.workday.repository

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.ContractExternal
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.ContractType
import community.flock.eco.workday.application.repository.ContractRepository
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import javax.transaction.Transactional
import kotlin.test.assertEquals

@Transactional
class ContractRepositoryTest(
    @Autowired private val contractRepository: ContractRepository,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    @Test
    fun `create and update internal contract`() {
        val person = createHelper.createPerson("Hello", "Bye")
        val new =
            ContractInternal(
                person = person,
                from = LocalDate.of(2020, 1, 1),
                hoursPerWeek = 40,
                monthlySalary = 500.0,
                holidayHours = 192,
                hackHours = 160,
            )
        val saved = contractRepository.save(new)
        val update =
            saved.copy(
                to = LocalDate.of(2020, 6, 1),
                hoursPerWeek = 80,
                monthlySalary = 1000.0,
            )
        val updated = contractRepository.save(update)

        assertEquals(saved.id, updated.id)
        assertEquals(saved.code, updated.code)

        val find = contractRepository.findAllByType(ContractType.INTERNAL)
        assertEquals(1, find.toList().size)
        assertEquals(find.first().id, updated.id)
        assertEquals(find.first().code, updated.code)
    }

    @Test
    fun `create and update external contract`() {
        val person = createHelper.createPerson("Hello", "Bye")
        val new =
            ContractExternal(
                person = person,
                from = LocalDate.of(2020, 1, 1),
                hoursPerWeek = 40,
                hourlyRate = 500.0,
            )
        val saved = contractRepository.save(new)
        val update =
            saved.copy(
                to = LocalDate.of(2020, 6, 1),
                hoursPerWeek = 80,
                hourlyRate = 1000.0,
            )
        val updated = contractRepository.save(update)

        assertEquals(saved.id, updated.id)
        assertEquals(saved.code, updated.code)

        val find = contractRepository.findAllByType(ContractType.EXTERNAL)
        assertEquals(1, find.toList().size)
        assertEquals(find.first().id, updated.id)
        assertEquals(find.first().code, updated.code)
    }
}
