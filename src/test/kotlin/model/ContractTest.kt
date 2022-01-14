package model

import community.flock.eco.workday.model.sumHoursWithinAPeriod
import org.junit.jupiter.api.Test
import java.time.LocalDate
import kotlin.test.assertEquals

class ContractTest : ContractAbstract() {

    @Test
    fun `sum hours with two contracts in the same month`() {
        val startDateFirstContract = LocalDate.of(2020, 10, 27)
        val endDateFirstContract = LocalDate.of(2021, 10, 26)
        val startDateSecondContract = LocalDate.of(2021, 10, 27)
        val endDateSecondContract = LocalDate.of(2021, 12, 31)
        val firstContract = createContractExternal(startDateFirstContract, endDateFirstContract, 85.0, 5)
        val secondContract = createContractExternal(startDateSecondContract, endDateSecondContract, 85.0, 5)

        val periodStart = LocalDate.of(2021, 10, 1)
        val periodEnd = LocalDate.of(2021, 10, 31)
        val result = listOf(firstContract, secondContract).sumHoursWithinAPeriod(periodStart, periodEnd)
        assertEquals(21, result)
    }

    @Test
    fun `sum hours when contract starts before period and ends within period `() {
        val startDateFirstContract = LocalDate.of(2021, 9, 1)
        val endDateFirstContract = LocalDate.of(2021, 10, 26)
        val firstContract = createContractExternal(startDateFirstContract, endDateFirstContract, 85.0, 5)

        val periodStart = LocalDate.of(2021, 10, 1)
        val periodEnd = LocalDate.of(2021, 10, 31)
        val result = listOf(firstContract).sumHoursWithinAPeriod(periodStart, periodEnd)
        assertEquals(18, result)
    }
}
