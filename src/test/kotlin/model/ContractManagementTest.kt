package model

import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.test.assertEquals

class ContractManagementTest : ContractAbstract() {
    @Test
    fun `total cost for internal contract when it is within request date range `() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2021, 12, 15)

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 10)

        val cost =
            createContractManagement(contractStart, contractEnd, 3000.0)
                .totalCostsInPeriod(periodStart, periodEnd)
        assertEquals(BigDecimal("967.7419354839"), cost)
    }

    @Test
    fun `total cost of internal contract when date range starts sooner than the contract`() {
        val contractStart = LocalDate.of(2021, 12, 15)
        val contractEnd = LocalDate.of(2021, 12, 31)

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 31)

        val cost =
            createContractManagement(contractStart, contractEnd, 1234.56)
                .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("677.0167741935"), cost)
    }

    @Test
    fun `total cost of internal contract when date range starts sooner than the contract and the date ranges between multiple months`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2022, 1, 31)

        val periodStart = LocalDate.of(2021, 11, 1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost =
            createContractManagement(contractStart, contractEnd, 3000.0)
                .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("4451.6129032258"), cost)
    }

    @Test
    fun `total cost of internal contract when contract has no end date and date ranges between mutiple months`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 11, 1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost =
            createContractManagement(contractStart, contractEnd, 3000.0)
                .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("4451.6129032258"), cost)
    }

    @Test
    fun `total cost of internal contract when contract has no end date`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 1, 1)
        val periodEnd = LocalDate.of(2022, 1, 15)

        val cost =
            createContractManagement(contractStart, contractEnd, 41985.58)
                .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("62301.1832258065"), cost)
    }

    @Test
    fun `total cost of internal contract when the contract is not within the date range`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = LocalDate.of(2021, 12, 15)

        val periodStart = LocalDate.of(2021, 12, 16)
        val periodEnd = LocalDate.of(2022, 12, 31)

        val cost =
            createContractManagement(contractStart, contractEnd, 41985.58)
                .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("0"), cost)
    }

    @Test
    fun `total cost of internal contract when the date range is a whole month`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 31)

        val cost =
            createContractManagement(contractStart, contractEnd, 41985.58)
                .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("41985.5800000000"), cost)
    }

    @Test
    fun `total cost of internal contract when the date range is between two days`() {
        val contractStart = LocalDate.of(2021, 12, 1)
        val contractEnd = null

        val periodStart = LocalDate.of(2021, 12, 1)
        val periodEnd = LocalDate.of(2021, 12, 2)

        val cost =
            createContractManagement(contractStart, contractEnd, 3100.0)
                .totalCostsInPeriod(periodStart, periodEnd)

        assertEquals(BigDecimal("200.0000000000"), cost)
    }
}
