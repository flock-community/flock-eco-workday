package community.flock.eco.workday.application.model

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.ContractInternalForm
import community.flock.eco.workday.application.services.ContractService
import community.flock.eco.workday.helpers.CreateHelper
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import javax.sql.DataSource
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@Transactional
class ContractInternalPersistenceTest : WorkdayIntegrationTest() {
    @Autowired
    lateinit var createHelper: CreateHelper

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var dataSource: DataSource

    @Autowired
    lateinit var contractService: ContractService

    @Test
    fun testTrainingHoursPersistsAsInt() {
        val person = createHelper.createPersonEntity()
        val contract =
            ContractInternalForm(
                personId = person.uuid,
                monthlySalary = 4000.0,
                hoursPerWeek = 40,
                from = LocalDate.now(),
                to = null,
                holidayHours = 192,
                hackTimeBudget = 160,
                billable = true,
                trainingTimeBudget = 120,
                trainingMoneyBudget = BigDecimal.ZERO,
            ).let { contractService.create(it) }

        entityManager.flush()
        entityManager.clear()

        val retrieved = contractService.findByCode(contract!!.code)
        assertEquals(120, (retrieved as ContractInternal).trainingTimeBudget, "trainingTimeBudget should persist as Int value 120")
    }

    @Test
    fun testTrainingMoneyPersistsAsBigDecimal() {
        val person = createHelper.createPersonEntity()
        val contract =
            ContractInternalForm(
                personId = person.uuid,
                monthlySalary = 4000.0,
                hoursPerWeek = 40,
                from = LocalDate.now(),
                to = null,
                holidayHours = 192,
                hackTimeBudget = 160,
                billable = true,
                trainingTimeBudget = 0,
                trainingMoneyBudget = BigDecimal("2500.50"),
            ).let { contractService.create(it) }

        entityManager.flush()
        entityManager.clear()

        val retrieved = contractService.findByCode(contract!!.code)
        assertEquals(
            0,
            BigDecimal("2500.50").compareTo((retrieved as ContractInternal).trainingMoneyBudget),
            "trainingMoneyBudget should persist as BigDecimal with value 2500.50",
        )
    }

    @Test
    fun testDefaultValuesForExistingContracts() {
        val person = createHelper.createPersonEntity()
        val contract =
            createHelper.createContractInternal(
                person = person,
                from = LocalDate.now(),
                to = null,
            )

        entityManager.flush()
        entityManager.clear()

        val retrieved = contractService.findByCode(contract.code)
        assertEquals(0, (retrieved as ContractInternal).trainingTimeBudget, "Default trainingTimeBudget should be 0")
        assertEquals(
            0,
            BigDecimal.ZERO.compareTo(retrieved.trainingMoneyBudget),
            "Default trainingMoneyBudget should be BigDecimal.ZERO",
        )
    }

    @Test
    fun testTrainingMoneyColumnName() {
        // H2 stores identifiers in lowercase by default
        dataSource.connection.use { conn ->
            val rs = conn.metaData.getColumns(null, null, "contract_internal", "training_money_budget")
            assertTrue(rs.next(), "Column training_money_budget should exist in contract_internal table")
        }
    }
}
