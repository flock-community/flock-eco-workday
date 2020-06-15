package community.flock.eco.workday.repository

import community.flock.eco.workday.Application
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractType
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import java.time.LocalDate
import javax.transaction.Transactional
import kotlin.test.assertEquals

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class, CreateHelper::class])
@AutoConfigureTestDatabase
@ActiveProfiles(profiles = ["test"])
@Transactional
class ContractRepositoryTest {

    @Autowired
    private lateinit var contractRepository: ContractRepository

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Test
    fun `create and update internal contract`() {
        val person = createHelper.createPerson("Hello", "Bye")
        val new = ContractInternal(
            person = person,
            from = LocalDate.of(2020, 1, 1),
            hoursPerWeek = 40,
            monthlySalary = 500.0
        )
        val saved = contractRepository.save(new)
        val update = saved.copy(
            to = LocalDate.of(2020, 6, 1),
            hoursPerWeek = 80,
            monthlySalary = 1000.0
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
        val new = ContractExternal(
            person = person,
            from = LocalDate.of(2020, 1, 1),
            hoursPerWeek = 40,
            hourlyRate = 500.0
        )
        val saved = contractRepository.save(new)
        val update = saved.copy(
            to = LocalDate.of(2020, 6, 1),
            hoursPerWeek = 80,
            hourlyRate = 1000.0
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
