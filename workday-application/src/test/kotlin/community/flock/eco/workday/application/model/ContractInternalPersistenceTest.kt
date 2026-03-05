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
    fun testStudyHoursPersistsAsInt() {
        // Create a person + contract with studyHours = 120
        val person = createHelper.createPersonEntity()
        val contract = ContractInternalForm(
            personId = person.uuid,
            monthlySalary = 4000.0,
            hoursPerWeek = 40,
            from = LocalDate.now(),
            to = null,
            holidayHours = 192,
            hackHours = 160,
            billable = true,
            studyHours = 120,
            studyMoney = BigDecimal.ZERO
        ).let { contractService.create(it) }

        // Force flush and clear persistence context
        entityManager.flush()
        entityManager.clear()

        // Retrieve and verify studyHours == 120
        val retrieved = contractService.findByCode(contract!!.code)
        assertEquals(120, (retrieved as ContractInternal).studyHours, "studyHours should persist as Int value 120")
    }

    @Test
    fun testStudyMoneyPersistsAsBigDecimal() {
        // Create contract with studyMoney = BigDecimal("2500.50")
        val person = createHelper.createPersonEntity()
        val contract = ContractInternalForm(
            personId = person.uuid,
            monthlySalary = 4000.0,
            hoursPerWeek = 40,
            from = LocalDate.now(),
            to = null,
            holidayHours = 192,
            hackHours = 160,
            billable = true,
            studyHours = 0,
            studyMoney = BigDecimal("2500.50")
        ).let { contractService.create(it) }

        // Force flush and clear persistence context
        entityManager.flush()
        entityManager.clear()

        // Retrieve and verify studyMoney value with BigDecimal precision
        val retrieved = contractService.findByCode(contract!!.code)
        assertEquals(
            0,
            BigDecimal("2500.50").compareTo((retrieved as ContractInternal).studyMoney),
            "studyMoney should persist as BigDecimal with value 2500.50"
        )
    }

    @Test
    fun testDefaultValuesForExistingContracts() {
        // Create contract without specifying studyHours/studyMoney (use defaults)
        val person = createHelper.createPersonEntity()
        val contract = createHelper.createContractInternal(
            person = person,
            from = LocalDate.now(),
            to = null
        )

        // Force flush and clear persistence context
        entityManager.flush()
        entityManager.clear()

        // Retrieve and verify defaults
        val retrieved = contractService.findByCode(contract.code)
        assertEquals(0, (retrieved as ContractInternal).studyHours, "Default studyHours should be 0")
        assertEquals(
            0,
            BigDecimal.ZERO.compareTo(retrieved.studyMoney),
            "Default studyMoney should be BigDecimal.ZERO"
        )
    }

    @Test
    fun testStudyMoneyColumnName() {
        // Use JDBC to verify column is named study_money_budget (not study_money)
        // H2 stores identifiers in lowercase by default
        dataSource.connection.use { conn ->
            val rs = conn.metaData.getColumns(null, null, "contract_internal", "study_money_budget")
            assertTrue(rs.next(), "Column study_money_budget should exist in contract_internal table")
        }
    }
}
