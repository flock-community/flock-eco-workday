package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.interfaces.Period
import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.ContractType
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.services.AggregationService
import community.flock.eco.workday.application.services.countWorkDaysInPeriod
import community.flock.eco.workday.application.utils.DateUtils.countWorkDaysInMonth
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.helpers.DataHelper
import community.flock.eco.workday.helpers.OrganisationHelper
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@Transactional
class AggregationServiceTest(
    @Autowired val dataHelper: DataHelper,
    @Autowired val createHelper: CreateHelper,
    @Autowired val organisationHelper: OrganisationHelper,
    @Autowired val aggregationService: AggregationService,
) : WorkdayIntegrationTest() {
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

        val res =
            aggregationService
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

        val res =
            aggregationService
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
        val workDay =
            createHelper.createWorkDay(
                assignment = assignment,
                from = from,
                to = to,
                hours = 152.0,
                days =
                    listOf(
                        0.0,
                        0.0,
                        8.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        0.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        0.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                    ),
            )

        val period: Period =
            object : Period {
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
        val workDay =
            createHelper.createWorkDay(
                assignment = assignment,
                from = from,
                to = to,
                hours = 152.0,
                days =
                    listOf(
                        0.0,
                        0.0,
                        8.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        0.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        0.0,
                        0.0,
                        0.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                        8.0,
                    ),
            )

        val period: Period =
            object : Period {
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
        val res =
            aggregationService
                .totalPerPerson(from, to)

        val holiDayBalance: BigDecimal = res.first().leaveDayBalance
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
        val res =
            aggregationService
                .totalPerPerson(from, to)

        val holiDayBalance: BigDecimal = res.first().leaveDayBalance
        assertEquals(holiDayBalance.toString(), "192.0000000000")
    }

    @Test
    fun `holiday balance one person part time contract`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)
        val person = createHelper.createPerson()
        createHelper.createContractInternal(person, from, to, hoursPerWeek = 32)
        val res =
            aggregationService
                .totalPerPerson(from, to)
        val holiDayBalance: BigDecimal = res.first().leaveDayBalance
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

        val days =
            listOf(1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0)
        createHelper.createWorkDay(assignment, LocalDate.of(2020, 1, 20), LocalDate.of(2020, 2, 20), days)

        val yearMonth = YearMonth.of(2020, 1)
        val totalPerMonth = aggregationService.totalPerMonth(yearMonth)
        val totalPerPerson = aggregationService.totalPerPerson(yearMonth)

        assertEquals(1, totalPerMonth[0].countContractInternal)
        assertEquals(8 * 8.0 * 80.0, totalPerMonth[0].actualRevenue.toDouble())
        assertEquals(8 * 8.0, totalPerPerson[0].workDays.toDouble())
    }

    @Test
    fun `find netto revenue factor`() {
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
        val res = aggregationService.leaveDayReport(2020)
        assertEquals(res[0].contractHours, 192.toBigDecimal().setScale(10))
        assertEquals(res[2].contractHours, 160.toBigDecimal().setScale(10))
    }

    private fun CreateHelper.createWorkDay(
        assignment: Assignment,
        from: LocalDate,
        to: LocalDate,
        input: List<Int>,
    ) {
        val days = input.map { it * 8.0 }
        val hours = days.sum()
        this.createWorkDay(assignment, from, to, hours, days)
    }

    @Test
    fun `hour overview per client per employee`() {
        val startDate = LocalDate.of(2021, 12, 1)
        val endDate = LocalDate.of(2021, 12, 31)

        createMockDataForClientHourOverview(startDate, endDate)

        val thomasHoursExpectedFlock =
            listOf(
                4.0,
                4.0,
                4.0,
                0.0,
                0.0,
                1.0,
                2.0,
                3.0,
                4.0,
                5.0,
                0.0,
                0.0,
                9.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
            )
        val piotrHoursExpected =
            listOf(
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
            )
        val totalHoursExpectedFlock = piotrHoursExpected.zip(thomasHoursExpectedFlock) { xv, yv -> xv + yv }

        val personHoursExpected =
            listOf(
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                1.0,
                2.0,
                0.0,
                0.0,
                3.0,
                4.0,
                5.0,
                6.0,
                7.0,
                0.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
            )
        val bojackHoursExpected =
            listOf(
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
            )
        val walterHoursExpected =
            listOf(
                3.0,
                3.0,
                3.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
            )
        val thomasHoursExpectedOther =
            listOf(
                4.0,
                4.0,
                4.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
            )
        val otherClientHoursExpected =
            bojackHoursExpected.zip(personHoursExpected) { xv, yv -> xv + yv }
                .zip(walterHoursExpected) { xv, yv -> xv + yv }
                .zip(thomasHoursExpectedOther) { xv, yv -> xv + yv }

        val overview = aggregationService.clientPersonHourOverview(startDate, endDate)

        val clientOverviewForFlock = overview.first { it.client.name == "Flock.community" }
        val clientOverviewForOtherCompany = overview.first { it.client.name == "Other.client" }

        val thomasFlock = clientOverviewForFlock.aggregationPerson.first { it.person.name == "Thomas Creativelastname" }
        val thomasOther =
            clientOverviewForOtherCompany.aggregationPerson.first { it.person.name == "Thomas Creativelastname" }
        val piotr = clientOverviewForFlock.aggregationPerson.first { it.person.name == "Jesse Pinkman" }
        val namelessPerson =
            clientOverviewForOtherCompany.aggregationPerson.first { it.person.name == "Person Lastname" }
        val bojack = clientOverviewForOtherCompany.aggregationPerson.first { it.person.name == "Bojack Horseman" }
        val walter = clientOverviewForOtherCompany.aggregationPerson.first { it.person.name == "Walter White" }

        assertEquals("Flock.community", clientOverviewForFlock.client.name)
        assertEquals("Other.client", clientOverviewForOtherCompany.client.name)

        assertEquals(31, clientOverviewForFlock.totals.size)
        assertEquals(31, clientOverviewForOtherCompany.totals.size)

        assertEquals(184.0f, piotr.total)
        assertEquals(12.0f, thomasOther.total)
        assertEquals(148.0f, thomasFlock.total)
        assertEquals(60.0f, namelessPerson.total)
        assertEquals(184.0f, bojack.total)
        assertEquals(9.0f, walter.total)

        assertEquals(thomasHoursExpectedFlock.toString(), thomasFlock.hours.toString())
        assertEquals(thomasHoursExpectedOther.toString(), thomasOther.hours.toString())
        assertEquals(piotrHoursExpected.toString(), piotr.hours.toString())
        assertEquals(personHoursExpected.toString(), namelessPerson.hours.toString())
        assertEquals(bojackHoursExpected.toString(), bojack.hours.toString())
        assertEquals(walterHoursExpected.toString(), walter.hours.toString())

        assertEquals(totalHoursExpectedFlock.toString(), clientOverviewForFlock.totals.toString())
        assertEquals(otherClientHoursExpected.toString(), clientOverviewForOtherCompany.totals.toString())
    }

    private fun createMockDataForClientHourOverview(
        startDate: LocalDate,
        endDate: LocalDate,
    ): List<WorkDay> {
        val flockClient = createHelper.createClient("Flock.community")
        val otherClient = createHelper.createClient("Other.client")
        val firstPerson = createHelper.createPerson("Jesse", "Pinkman")
        val secondPerson = createHelper.createPerson("Thomas", "Creativelastname")
        val thirdPerson = createHelper.createPerson("Person", "Lastname")
        val fourthPersonWithoutDays = createHelper.createPerson("Bojack", "Horseman")
        val fifthPersonWithoutDays = createHelper.createPerson("Walter", "White")

        val firstAssignment = createHelper.createAssignment(flockClient, firstPerson, startDate.minusDays(10), endDate)
        val secondAssignment =
            createHelper.createAssignment(flockClient, secondPerson, startDate.plusDays(5), endDate.plusDays(2))
        val secondAssignmentFlock =
            createHelper.createAssignment(flockClient, secondPerson, startDate, startDate.plusDays(2))
        val secondAssignmentOther =
            createHelper.createAssignment(otherClient, secondPerson, startDate, startDate.plusDays(2))
        val thirdAssignment =
            createHelper.createAssignment(otherClient, thirdPerson, startDate.plusDays(10), endDate.minusDays(5))
        val fourthAssignment =
            createHelper.createAssignment(otherClient, fourthPersonWithoutDays, startDate.minusDays(1), endDate)
        val fifthAssignment =
            createHelper.createAssignment(
                otherClient,
                fifthPersonWithoutDays,
                startDate.minusDays(2),
                startDate.plusDays(2),
                15,
            )

        val hoursFullMonth =
            listOf(
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
            )
        val hoursSecondAssignment =
            listOf(
                1.0,
                2.0,
                3.0,
                4.0,
                5.0,
                0.0,
                0.0,
                9.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                0.0,
                0.0,
                8.0,
                8.0,
                8.0,
                8.0,
                8.0,
                9.0,
                9.0,
            )
        val hoursThirdAssignment =
            listOf(1.0, 2.0, 0.0, 0.0, 3.0, 4.0, 5.0, 6.0, 7.0, 0.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0)

        val workday1 =
            createHelper.createWorkDay(
                firstAssignment,
                startDate.minusDays(10),
                endDate,
                hoursFullMonth.sum(),
                hoursFullMonth,
            )
        val workday2 =
            createHelper.createWorkDay(
                secondAssignment,
                startDate.plusDays(5),
                endDate.plusDays(2),
                hoursSecondAssignment.sum(),
                hoursSecondAssignment,
            )
        val workday3 =
            createHelper.createWorkDayWithoutDays(secondAssignmentFlock, startDate, startDate.plusDays(2), 12.0, null)
        val workday4 =
            createHelper.createWorkDayWithoutDays(secondAssignmentOther, startDate, startDate.plusDays(2), 12.0, null)
        val workday5 =
            createHelper.createWorkDay(
                thirdAssignment,
                startDate.plusDays(10),
                endDate.minusDays(5),
                hoursThirdAssignment.sum(),
                hoursThirdAssignment,
            )
        val workday6 =
            createHelper.createWorkDayWithoutDays(fourthAssignment, startDate.minusDays(1), endDate, 192.0, null)
        val workday7 =
            createHelper.createWorkDayWithoutDays(
                fifthAssignment,
                startDate.minusDays(2),
                startDate.plusDays(2),
                15.0,
                null,
            )
        return listOf(workday1, workday2, workday3, workday4, workday5, workday6, workday7)
    }

    @Test
    fun `test revenue report`() {
        val startDate = LocalDate.of(2021, 12, 1)
        val endDate = LocalDate.of(2021, 12, 31)
        val workdays = createMockDataForClientHourOverview(startDate, endDate)

        val result = aggregationService.personClientRevenueOverview(workdays, startDate, endDate)
        val thomas = result.filter { it.key.name == "Thomas Creativelastname" }.values.flatMap { it.clients }
        val jesse = result.filter { it.key.name == "Jesse Pinkman" }.values.flatMap { it.clients }

        val thomasClientsFlock = thomas.first { it.client.name == "Flock.community" }
        val thomasClientsOther = thomas.first { it.client.name == "Other.client" }
        val jesseTotal = jesse[0].revenue

        assertEquals(BigDecimal("11840.00000000000"), thomasClientsFlock.revenue)
        assertEquals(BigDecimal("960.00000000000"), thomasClientsOther.revenue)
        assertEquals(BigDecimal("14720.00"), jesseTotal)
    }

    @Test
    fun `total per person me overview`() {
        val person1 = createHelper.createPerson("Jesse", "Pinkman")
        val person2 = createHelper.createPerson("Walter", "White")
        val from = LocalDate.of(2021, 12, 1)
        val to = LocalDate.of(2021, 12, 5)

        createHelper.createContractExternal(person2, from.minusDays(2), to.plusDays(2))
        createHelper.createContractInternal(person2, from.minusDays(2), to.plusDays(2))
        val client = createHelper.createClient()
        val assignment = createHelper.createAssignment(client, person2, from, to)
        createHelper.createHoliDay(person2, from, to)
        createHelper.createWorkDay(assignment, from, to, null, null)
        createHelper.createEvent(from, to, 40.0, listOf(8.0, 8.0, 8.0, 8.0, 8.0), listOf(person1.uuid, person2.uuid))
        createHelper.createEvent(from, to, 40.0, listOf(8.0, 8.0, 8.0, 8.0, 8.0), listOf(person2.uuid))
        createHelper.createSickDay(person1, from, to)
        val result = aggregationService.totalPerPerson(from, to, person2)
        assertEquals(2, result.contractTypes.size)
        assertEquals(BigDecimal("40.0"), result.workDays)
        assertEquals(BigDecimal("40.0"), result.workDays)
        assertEquals(80, result.event)
        assertEquals(BigDecimal("40.0"), result.leaveDayUsed)
    }

    @Test
    fun `holiday overview me`() {
        val person = createHelper.createPerson("Jesse", "Pinkman")
        val from = LocalDate.of(2021, 12, 1)
        val to = LocalDate.of(2021, 12, 5)
        createHelper.createContractInternal(person, LocalDate.of(2021, 1, 1), LocalDate.of(2021, 12, 31))
        createHelper.createHoliDay(person, from, to)

        val result = aggregationService.leaveDayReportMe(2021, person)
        assertEquals(BigDecimal("192.0000000000"), result.contractHours)
        assertEquals(BigDecimal("40.0"), result.holidayHours)
    }
}
