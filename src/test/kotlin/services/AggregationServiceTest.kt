package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.helpers.DataHelper
import community.flock.eco.workday.helpers.OrganisationHelper
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.ContractType
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import javax.transaction.Transactional
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@SpringBootTest(classes = [ApplicationConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class, DataHelper::class, OrganisationHelper::class)
@ActiveProfiles(profiles = ["test"])
class AggregationServiceTest(
    @Autowired val dataHelper: DataHelper,
    @Autowired val createHelper: CreateHelper,
    @Autowired val organisationHelper: OrganisationHelper,
    @Autowired val aggregationService: AggregationService
) {

    private val firstDayOfYear = LocalDate.of(2020, 1, 1)
    private val lastDayOfYear = LocalDate.of(2020, 12, 31)

    private fun LocalDate.endOfMonth() = YearMonth.from(this).atEndOfMonth()

    @Test
    fun `days per person`() {

        val from = firstDayOfYear
        val to = lastDayOfYear

        dataHelper.createContractExternalData()
        dataHelper.createAssignmentData()
        dataHelper.createSickDayData()
        dataHelper.createHoliDayData()
        dataHelper.createHoliDayData()

        val res = aggregationService
            .totalPerPerson(from, to)

        assertNotNull(res[0].name)
    }

    @Test
    fun `total per month`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        dataHelper.createContractExternalData()
        dataHelper.createContractInternalData()
        val assignments = dataHelper.createAssignmentData()
        dataHelper.createSickDayData()
        dataHelper.createHoliDayData()
        dataHelper.createHoliDayData()
        dataHelper.createWorkDayData()

        createHelper.createWorkDay(assignments["in1"]!!, from, from.plusDays(4))
        createHelper.createWorkDay(assignments["in1"]!!, from.plusDays(28), from.plusDays(32))

        val res = aggregationService
            .totalPerMonth(from, to)

        assertNotNull(res[0].actualRevenue)
        assertEquals("12000.0000000000", res[0].actualCostContractInternal.toString())
        assertEquals("0", res[0].actualCostContractExternal.toString())
        assertEquals("11520.00", res[0].actualRevenue.toString())
        assertEquals("0", res[0].actualRevenueInternal.toString())
        assertEquals("0", res[0].actualRevenueExternal.toString())
        assertEquals("23.4782608696", res[0].forecastHoursGross.toString())
    }

    @Test
    fun `workday revenue per day full period`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)
        val workDay = createHelper.createWorkDay(assignment, from, to, 152.0, listOf(0.0, 0.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0))

        val period: Period = object : Period {
            override val from: LocalDate get() = from
            override val to: LocalDate? get() = to
        }

        val hours = workDay.totalHoursInPeriod(period)
        val revenue = workDay.totalRevenueInPeriod(period)

        assertEquals(152.0.toBigDecimal(), hours)
        assertEquals(12160.0.toBigDecimal().setScale(2), revenue)
    }

    @Test
    fun `workday revenue per day half period`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)
        val workDay = createHelper.createWorkDay(assignment, from, to, 152.0, listOf(0.0, 0.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0))

        val period: Period = object : Period {
            override val from: LocalDate get() = from
            override val to: LocalDate? get() = LocalDate.of(2020, 1, 15)
        }

        val hours = workDay.totalHoursInPeriod(period)
        val revenue = workDay.totalRevenueInPeriod(period)

        assertEquals(64.0.toBigDecimal(), hours)
        assertEquals(5120.0.toBigDecimal().setScale(2), revenue)
    }

    @Test
    fun `holiday balance one person full time`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)
        val person = createHelper.createPerson()
        createHelper.createContractInternal(person, from, to)
        val res = aggregationService
            .totalPerPerson(from, to)

        val holiDayBalance: BigDecimal = res.first().holiDayBalance as BigDecimal
        assertEquals(holiDayBalance.toString(), "192.0000000000")
    }

    @Test
    fun `holiday balance one person full time split contract`() {
        val from = LocalDate.of(2020, 1, 1)
        val splita = LocalDate.of(2020, 6, 25)
        val splitb = LocalDate.of(2020, 6, 26)
        val to = LocalDate.of(2020, 12, 31)
        val person = createHelper.createPerson()
        createHelper.createContractInternal(person, from, splita)
        createHelper.createContractInternal(person, splitb, to)
        val res = aggregationService
            .totalPerPerson(from, to)

        val holiDayBalance: BigDecimal = res.first().holiDayBalance as BigDecimal
        assertEquals(holiDayBalance.toString(), "192.0000000000")
    }

    @Test
    fun `holiday balance one person part time contract`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)
        val person = createHelper.createPerson()
        createHelper.createContractInternal(person, from, to, hoursPerWeek = 32)
        val res = aggregationService
            .totalPerPerson(from, to)
        val holiDayBalance: BigDecimal = res.first().holiDayBalance as BigDecimal
        assertEquals(holiDayBalance.toString(), "153.6000000000")
    }

    @Test
    fun `one internal employee one full month`() {

        val client = createHelper.createClient()
        val internal = organisationHelper.createPersonsWithContract(ContractType.INTERNAL)
        val assignment = createHelper.createAssignment(client, internal, firstDayOfYear, lastDayOfYear)

        val days = listOf(1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0)
        createHelper.createWorkDay(assignment, firstDayOfYear, firstDayOfYear.endOfMonth(), days)

        val yearMonth = YearMonth.of(2020, 1)
        val totalPerMonth = aggregationService.totalPerMonth(yearMonth)
        val totalPerPerson = aggregationService.totalPerPerson(yearMonth)

        assertEquals(1, totalPerMonth[0].countContractInternal)
        assertEquals(days.map { it * 8.0 * 80.0 }.sum(), totalPerMonth[0].actualRevenue.toDouble())
        assertEquals(days.map { it * 8.0 }.sum(), totalPerPerson[0].workDays.toDouble())
    }

    @Test
    fun `one internal employee one broken month`() {

        val client = createHelper.createClient()
        val internal = organisationHelper.createPersonsWithContract(ContractType.INTERNAL)
        val assignment = createHelper.createAssignment(client, internal, firstDayOfYear, lastDayOfYear)

        val days = listOf(1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0)
        createHelper.createWorkDay(assignment, LocalDate.of(2020, 1, 20), LocalDate.of(2020, 2, 20), days)

        val yearMonth = YearMonth.of(2020, 1)
        val totalPerMonth = aggregationService.totalPerMonth(yearMonth)
        val totalPerPerson = aggregationService.totalPerPerson(yearMonth)

        assertEquals(1, totalPerMonth[0].countContractInternal)
        assertEquals(8 * 8.0 * 80.0, totalPerMonth[0].actualRevenue.toDouble())
        assertEquals(8 * 8.0, totalPerPerson[0].workDays.toDouble())
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

    @Test
    fun `holiday report`() {
        dataHelper.createContractInternalData()
        val res = aggregationService.holidayReport(2020)
        assertEquals(res[0].contractHours, 192.toBigDecimal().setScale(10))
        assertEquals(res[2].contractHours, 160.toBigDecimal().setScale(10))
    }

    private fun CreateHelper.createWorkDay(
        assignment: Assignment,
        from: LocalDate,
        to: LocalDate,
        input: List<Int>
    ) {
        val days = input.map { it * 8.0 }
        val hours = days.sum()
        createHelper.createWorkDay(assignment, from, to, hours, days)
    }

    @Test
    fun `hour overview per client per employee`() {
        val startDate = LocalDate.of(2021, 12, 1)
        val endDate = LocalDate.of(2021, 12, 31)

        createMockDataForClientHourOverview(startDate, endDate)

        val thomasHoursExpected = listOf(0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 0.0, 0.0, 9.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0)
        val piotrHoursExpected = listOf(8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0)
        val totalHoursExpectedFlock = piotrHoursExpected.zip(thomasHoursExpected) { xv, yv -> xv + yv }

        val personHoursExpected = listOf(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 2.0, 0.0, 0.0, 3.0, 4.0, 5.0, 6.0, 7.0, 0.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 0.0, 0.0, 0.0)
        val bojackHoursExpected = listOf(8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0)
        val otherClientHoursExpected = bojackHoursExpected.zip(personHoursExpected) { xv, yv -> xv + yv }

        val overview = aggregationService.clientPersonHourOverview(startDate, endDate)

        val clientOverviewForFlock = overview.first { it.clientName == "Flock.community" }
        val clientOverviewForOtherCompany = overview.first { it.clientName == "Other.client" }

        val thomas = clientOverviewForFlock.aggregationPerson.first { it.personName == "Thomas Creativelastname" }
        val piotr = clientOverviewForFlock.aggregationPerson.first { it.personName == "Piotr Verycreativelastname" }
        val namelessPerson = clientOverviewForOtherCompany.aggregationPerson.first { it.personName == "Person Lastname" }
        val bojack = clientOverviewForOtherCompany.aggregationPerson.first { it.personName == "Bojack Horseman" }

        assertEquals("Flock.community", clientOverviewForFlock.clientName)
        assertEquals("Other.client", clientOverviewForOtherCompany.clientName)

        assertEquals(31, clientOverviewForFlock.totals.size)
        assertEquals(31, clientOverviewForOtherCompany.totals.size)

        assertEquals(184.0f, piotr.total)
        assertEquals(136.0f, thomas.total)
        assertEquals(60.0f, namelessPerson.total)
        assertEquals(184.0f, bojack.total)

        assertEquals(thomasHoursExpected.toString(), thomas.hours.toString())
        assertEquals(piotrHoursExpected.toString(), piotr.hours.toString())
        assertEquals(personHoursExpected.toString(), namelessPerson.hours.toString())
        assertEquals(bojackHoursExpected.toString(), bojack.hours.toString())

        assertEquals(totalHoursExpectedFlock.toString(), clientOverviewForFlock.totals.toString())
        assertEquals(otherClientHoursExpected.toString(), clientOverviewForOtherCompany.totals.toString())
    }

    private fun createMockDataForClientHourOverview(startDate: LocalDate, endDate: LocalDate) {

        val flockClient = createHelper.createClient("Flock.community")
        val otherClient = createHelper.createClient("Other.client")
        val firstPerson = createHelper.createPerson("Piotr", "Verycreativelastname")
        val secondPerson = createHelper.createPerson("Thomas", "Creativelastname")
        val thirdPerson = createHelper.createPerson("Person", "Lastname")
        val fourthPersonWithoutDays = createHelper.createPerson("Bojack", "Horseman")

        val firstAssignment = createHelper.createAssignment(flockClient, firstPerson, startDate.minusDays(10), endDate)
        val secondAssignment = createHelper.createAssignment(flockClient, secondPerson, startDate.plusDays(5), endDate.plusDays(2))
        val thirdAssignment = createHelper.createAssignment(otherClient, thirdPerson, startDate.plusDays(10), endDate.minusDays(5))
        val fourthAssignment = createHelper.createAssignment(otherClient, fourthPersonWithoutDays, startDate.minusDays(1), endDate)

        val hoursFullMonth = listOf(8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0)
        val hoursSecondAssignment = listOf(1.0, 2.0, 3.0, 4.0, 5.0, 0.0, 0.0, 9.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 9.0, 9.0)
        val hoursThirdAssignment = listOf(1.0, 2.0, 0.0, 0.0, 3.0, 4.0, 5.0, 6.0, 7.0, 0.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0)

        createHelper.createWorkDay(firstAssignment, startDate.minusDays(10), endDate, hoursFullMonth.sum(), hoursFullMonth)
        createHelper.createWorkDay(secondAssignment, startDate.plusDays(5), endDate.plusDays(2), hoursSecondAssignment.sum(), hoursSecondAssignment)
        createHelper.createWorkDay(thirdAssignment, startDate.plusDays(10), endDate.minusDays(5), hoursThirdAssignment.sum(), hoursThirdAssignment)
        createHelper.createWorkDayWithoutDays(fourthAssignment, startDate.minusDays(1), endDate, 192.0, null)
    }
}
