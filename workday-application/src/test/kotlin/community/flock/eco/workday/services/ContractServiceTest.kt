package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.services.ContractService
import community.flock.eco.workday.helpers.DataHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ContractServiceTest(
    @Autowired private val contractService: ContractService,
    @Autowired private val dataHelper: DataHelper,
) : WorkdayIntegrationTest() {
    @Test
    fun `find all active assignments`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val data = dataHelper.createContractExternalData()
        val res = contractService.findAllActive(from, to)

        assertEquals(6, res.size)
        assertTrue(res.contains(data["in1"]))
        assertTrue(res.contains(data["in2"]))
        assertTrue(res.contains(data["in3"]))
        assertTrue(res.contains(data["in4"]))
        assertTrue(res.contains(data["in5"]))
        assertTrue(res.contains(data["in6"]))
        assertFalse(res.contains(data["out1"]))
        assertFalse(res.contains(data["out2"]))
        assertFalse(res.contains(data["out3"]))
    }
}
