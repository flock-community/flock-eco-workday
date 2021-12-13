package model

import community.flock.eco.workday.model.ContractManagement
import community.flock.eco.workday.model.Person
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*
import kotlin.test.assertEquals

class ContractManagementTest {

    private val testPerson = Person(
        id = 0,
        uuid = UUID.randomUUID(),
        firstname = "Test",
        lastname = "Test",
        email = "test@test.test",
        position = "Hm",
        number = null,
        reminders = false,
        updates = false,
        user = null
    )

    @Test
    fun `total cost for internal contract when it is within request date range `() {

        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2021, 12, 15)

        val periodStart = LocalDate.of(2021, 12,1)
        val periodEnd = LocalDate.of(2021, 12, 10)

        val cost = createContract(contractStart, contractEnd, 3000.0)
            .totalCostsInPeriod(periodStart, periodEnd)
        assertEquals(BigDecimal("967.74193560000"), cost)
    }

    @Test
    fun `total cost of internal contract when date range starts sooner than the contract`() {
        val contractStart = LocalDate.of(2021, 12, 15)
        val contractEnd = LocalDate.of(2021, 12, 31)

        val periodStart = LocalDate.of(2021, 12,1)
        val periodEnd = LocalDate.of(2021, 12, 31)

        val cost = createContract(contractStart, contractEnd, 1234.56)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("677.016774225408"), cost)
    }

    @Test
    fun `total cost of internal contract when date range starts sooner than the contract and the date ranges between multiple months`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2022, 1, 31)

        val periodStart = LocalDate.of(2021, 11,1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost = createContract(contractStart, contractEnd, 3000.0)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("4451.61290310000"), cost)
    }

    @Test
    fun `total cost of internal contract when contract has no end date and date ranges between mutiple months`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 11,1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost = createContract(contractStart, contractEnd, 3000.0)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("4451.61290310000"), cost)
    }

    @Test
    fun `total cost of internal contract when contract has no end date`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 1,1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost = createContract(contractStart, contractEnd, 41985.58)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("62301.183224045766"), cost)
    }

    @Test
    fun `total cost of internal contract when the contract is not within the date range`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2021, 12, 15)

        val periodStart = LocalDate.of(2021, 12,16)
        val periodEnd = LocalDate.of(2022, 12, 31)

        val cost = createContract(contractStart, contractEnd, 41985.58)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("0E-12"), cost)
    }

    @Test
    fun `total cost of internal contract when the date range is a whole month`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 12,1)
        val periodEnd = LocalDate.of(2021, 12, 31)

        val cost = createContract(contractStart, contractEnd, 41985.58)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("41985.580000000000"), cost)
    }

    //TODO goes wrong with rounding
    @Test
    fun `total cost of internal contract when the date range is between two days`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 12,1)
        val periodEnd = LocalDate.of(2021, 12, 2)

        val cost = createContract(contractStart, contractEnd, 3100.0)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("200.00000000000"), cost)
    }
    private fun createContract(startDate: LocalDate, endDate: LocalDate? = null, salary: Double): ContractManagement {
        return  ContractManagement(id = 1L,
            code = UUID.randomUUID().toString(),
            person = testPerson,
            from = startDate,
            to = endDate,
            monthlyFee = salary
        )
    }
}
