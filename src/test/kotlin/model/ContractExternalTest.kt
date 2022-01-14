package model

import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.test.assertEquals

class ContractExternalTest : ContractAbstract() {

    @Test
    fun `total cost for external contract when it is within request date range `() {

        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2021, 12, 31)

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 31)

        val cost = createContractExternal(contractStart, contractEnd, 100.0, 36)
            .totalCostsInPeriod(periodStart, periodEnd)
        assertEquals(BigDecimal("16560.00000000000"), cost)
    }

    @Test
    fun `total cost for external contract when it is within request date range and less beautiful numbers`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2021, 12, 31)

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 31)

        val cost = createContractExternal(contractStart, contractEnd, 123.46, 37)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("21012.892000000000"), cost)
    }

    @Test
    fun `total cost of internal contract when date range starts sooner than the contract and the date ranges between multiple months`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2022, 1, 31)

        val periodStart = LocalDate.of(2021, 11, 1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost = createContractExternal(contractStart, contractEnd, 50.0, 40)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("13200.00000000000"), cost)
    }

    @Test
    fun `total cost of external contract when contract has no end date and date ranges between mutiple months`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 11, 1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost = createContractExternal(contractStart, contractEnd, 50.0, 36)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("11880.00000000000"), cost)
    }

    @Test
    fun `total cost of internal contract when contract has no end date`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 1, 1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost = createContractExternal(contractStart, contractEnd, 75.0, 20)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("9900.00000000000"), cost)
    }

    @Test
    fun `total cost of internal contract when the contract is not within the date range`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2021, 12, 15)

        val periodStart = LocalDate.of(2021, 12, 16)
        val periodEnd = LocalDate.of(2022, 12, 31)

        val cost = createContractExternal(contractStart, contractEnd, 123.45, 11)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("0.00"), cost)
    }

    @Test
    fun `total cost of internal contract when the date range is a whole month`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 31)

        val cost = createContractExternal(contractStart, contractEnd, 0.1, 1)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("0.46000000000"), cost)
    }

    @Test
    fun `total cost of internal contract when the date range is between two days`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 2)

        val cost = createContractExternal(contractStart, contractEnd, 123.45, 15)
            .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("740.700000000000"), cost)
    }
}
