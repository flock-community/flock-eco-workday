package community.flock.eco.workday.services

import community.flock.eco.workday.Application
import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.helpers.DataHelper
import community.flock.eco.workday.interfaces.Period
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import java.math.BigDecimal
import java.time.LocalDate
import javax.transaction.Transactional
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class, DataHelper::class])
@AutoConfigureTestDatabase
@ActiveProfiles(profiles = ["test"])
@Transactional
class AggregationServiceTest {

    @Autowired
    lateinit var dataHelper: DataHelper

    @Autowired
    lateinit var createHelper: CreateHelper

    @Autowired
    lateinit var aggregationService: AggregationService

    @Test
    fun `find revenue per month small`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 31)

        val client = createHelper.createClient("client")
        val person = createHelper.createPerson("firstname", "lastname")
        val assignment = createHelper.createAssignment(client, person, from, to)

        val res = aggregationService.revenuePerMonth(from, to)

        val total = res.entries.fold(BigDecimal.ZERO) { acc, cur -> acc + cur.value }
        val days = countWorkDaysInPeriod(from, to)
        val expect = (assignment.hourlyRate / 5) * assignment.hoursPerWeek * days
        assertEquals(1, res.size)
        assertEquals(expect, total.toDouble())
    }

    @Test
    fun `find revenue per month`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        dataHelper.createAssignmentData()
        val res = aggregationService.revenuePerMonth(from, to)

        val total = res.entries.fold(BigDecimal.ZERO) { acc, cur -> acc + cur.value }
        assertEquals(12, res.size)
        assertEquals(BigDecimal.valueOf(865728), total.stripTrailingZeros())
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
        assertEquals(48000, res.entries.fold(BigDecimal(0), { acc, cur -> acc + cur.value }).toInt())
    }

    @Test
    fun `find contract per month`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        dataHelper.createContractExternalData()
        val res = aggregationService.costPerMonth(from, to)

        assertEquals(12, res.size)
        assertEquals(41400, res.entries.first().value.toInt())
    }

    @Test
    fun `days per person`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        dataHelper.createContractExternalData()
        dataHelper.createAssignmentData()
        dataHelper.createSickDayData()
        dataHelper.createHoliDayData()
        dataHelper.createHoliDayData()

        val res = aggregationService
            .totalPerPerson(from, to)

        assertNotNull(res[0]["name"])
    }

    @Test
    fun `total per month`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        dataHelper.createContractExternalData()
        dataHelper.createContractInternalData()
        dataHelper.createAssignmentData()
        dataHelper.createSickDayData()
        dataHelper.createHoliDayData()
        dataHelper.createHoliDayData()
        dataHelper.createWorkDayData()

        val res = aggregationService
            .totalPerMonth(from, to)

        assertNotNull(res[0]["actualRevenue"])
        assertEquals("8000.0000000000", res[1]["actualCostContractInternal"].toString())
        assertEquals("0", res[1]["actualCostContractExternal"].toString())
    }

    @Test
    fun `workday revenue per day full period`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)
        val workDay = createHelper.createWorkDay(assignment, from, to, 152, listOf(0, 0, 8, 0, 0, 8, 8, 8, 8, 0, 0, 0, 8, 8, 8, 8, 8, 0, 0, 8, 8, 8, 8, 0, 0, 0, 8, 8, 8, 8, 8))

        val period: Period = object : Period {
            override val from: LocalDate get() = from
            override val to: LocalDate? get() = to
        }

        val hours = workDay.totalHoursInPeriod(period)
        val revenue = workDay.totalRevenueInPeriod(period)

        assertEquals(152.toBigDecimal(), hours)
        assertEquals(12160.0.toBigDecimal(), revenue)
    }

    @Test
    fun `workday revenue per day half period`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)
        val workDay = createHelper.createWorkDay(assignment, from, to, 152, listOf(0, 0, 8, 0, 0, 8, 8, 8, 8, 0, 0, 0, 8, 8, 8, 8, 8, 0, 0, 8, 8, 8, 8, 0, 0, 0, 8, 8, 8, 8, 8))

        val period: Period = object : Period {
            override val from: LocalDate get() = from
            override val to: LocalDate? get() = LocalDate.of(2020, 1, 15)
        }

        val hours = workDay.totalHoursInPeriod(period)
        val revenue = workDay.totalRevenueInPeriod(period)

        assertEquals(64.toBigDecimal(), hours)
        assertEquals(5120.0.toBigDecimal(), revenue)
    }

    @Test
    fun `find netto revenu factor`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)
        aggregationService.netRevenueFactor(from, to)
    }

    @Test
    fun `count days month`() {
        val data = LocalDate.of(2020, 1, 1)
        val res = data.countWorkDaysInMonth()
        assertEquals(23, res)
    }

    @Test
    fun `count days in period`() {
        val from = LocalDate.of(2020, 1, 6)
        val to = LocalDate.of(2020, 1, 10)
        val res = countWorkDaysInPeriod(from, to)
        assertEquals(5, res)
    }
}
