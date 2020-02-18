package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.helpers.DataHelper
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.test.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
@ComponentScan(basePackages = ["community.flock.eco.workday.helpers"])
class AggregationServiceTest {

    @Autowired
    lateinit var dataHelper: DataHelper

    @Autowired
    lateinit var createHelper: CreateHelper

    @Autowired
    lateinit var aggregationService: AggregationService

    @Test
    fun `find revenue per month`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        val data = dataHelper.createAssignmentData()
        val res = aggregationService.revenuePerMonth(from, to)

        assertEquals(12, res.size)
        assertEquals(38640.0, res.entries.first().value)
    }

    @Test
    fun `find contract per month one external contract`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        val person = createHelper.createPerson("firstname", "lastname")
        createHelper.createContractExternal(person, from, to)
        val res = aggregationService.costPerMonth(from, to)

        assertEquals(12, res.size)
        assertEquals(13800, res.entries.first().value.toInt())
    }

    @Test
    fun `find contract per month one internal contract`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        val person = createHelper.createPerson("firstname", "lastname")
        createHelper.createContractInternal(person, from, to)
        val res = aggregationService.costPerMonth(from, to)

        assertEquals(12, res.size)
        assertEquals(47998, res.entries.fold(BigDecimal(0), { acc, cur -> acc + cur.value }).toInt())
    }

    @Test
    fun `find contract per month`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        val data = dataHelper.createContractData()
        val res = aggregationService.costPerMonth(from, to)

        assertEquals(12, res.size)
        assertEquals(41400, res.entries.first().value.toInt())
    }

    @Test
    fun `person days`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        dataHelper.createAssignmentData()
        dataHelper.createContractData()

        // val res = aggregationService.personPerMonth(from, to)
    }

    @Test
    fun `count days`() {
        val data = LocalDate.of(2020, 1, 1)
        val res = data.countWorkDaysInmonth()
        assertEquals(23, res)
    }
}
