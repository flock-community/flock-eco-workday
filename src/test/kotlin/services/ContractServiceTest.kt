package community.flock.eco.workday.services

import community.flock.eco.workday.Application
import community.flock.eco.workday.helpers.DataHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate
import javax.transaction.Transactional
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@SpringBootTest(classes = [Application::class, DataHelper::class])
@AutoConfigureTestDatabase
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@ActiveProfiles(profiles = ["test"])
@Transactional
class ContractServiceTest(
    @Autowired private val contractService: ContractService,
    @Autowired private val dataHelper: DataHelper
) {

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
