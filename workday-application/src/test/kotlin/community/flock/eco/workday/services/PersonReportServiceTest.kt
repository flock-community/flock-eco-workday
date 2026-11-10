package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.ContractType
import community.flock.eco.workday.application.services.PersonReportService
import community.flock.eco.workday.helpers.CreateHelper
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

@Transactional
class PersonReportServiceTest(
    @Autowired val createHelper: CreateHelper,
    @Autowired val personReportService: PersonReportService,
) : WorkdayIntegrationTest() {
    private fun assertNumber(
        expected: String,
        actual: BigDecimal?,
    ) = assertTrue(
        actual != null && BigDecimal(expected).compareTo(actual) == 0,
        "Expected $expected but was $actual",
    )

    private fun createInternalPerson() =
        createHelper.createPersonEntity().also { person ->
            val client = createHelper.createClient()
            createHelper.createContractInternal(person, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31))
            val assignment = createHelper.createAssignment(client, person, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31))
            createHelper.createWorkDay(assignment, LocalDate.of(2024, 1, 8), LocalDate.of(2024, 1, 12))
            createHelper.createSickDay(person, LocalDate.of(2024, 2, 5), LocalDate.of(2024, 2, 9))
            createHelper.createHoliDay(person, LocalDate.of(2024, 3, 4), LocalDate.of(2024, 3, 8))
        }

    @Test
    fun `report has the figures per month of an internal person`() {
        val person = createInternalPerson()

        val report = personReportService.personReport(person = person).single()

        assertEquals(person, report.person)
        assertEquals(listOf("2024-01", "2024-02", "2024-03"), report.months.map { it.yearMonth.toString() })
        assertTrue(report.months.all { it.contractTypes == setOf(ContractType.INTERNAL) })

        val (january, february, march) = report.months.map { it.figures }
        assertNumber("184", january.contractHours)
        assertNumber("40", january.workHours)
        assertNumber("3200", january.revenue)
        assertNumber("4000", january.cost)
        assertNumber("-800", january.margin)
        assertNumber("80", january.averageHourlyRate)
        assertNumber("0.2174", january.utilization)

        assertNumber("168", february.contractHours)
        assertNumber("40", february.sickHours)
        assertNumber("128", february.availableHours)
        assertNumber("0", february.utilization)
        assertNull(february.averageHourlyRate)

        assertNumber("40", march.holidayHours)
        assertNumber("40", march.leaveHours)
    }

    @Test
    fun `report totals are the sum of the months`() {
        val person = createInternalPerson()

        val total = personReportService.personReport(person = person).single().total

        assertNumber("520", total.contractHours)
        assertNumber("40", total.workHours)
        assertNumber("3200", total.revenue)
        assertNumber("12000", total.cost)
        assertNumber("-8800", total.margin)
        assertNumber("40", total.sickHours)
        assertNumber("40", total.leaveHours)
        assertNumber("440", total.availableHours)
        assertNumber("0.0769", total.utilization)
        assertNumber("0.0909", total.utilizationAvailable)
    }

    @Test
    fun `report is limited to the requested months`() {
        val person = createInternalPerson()

        val report =
            personReportService
                .personReport(from = YearMonth.of(2024, 2), to = YearMonth.of(2024, 2), person = person)
                .single()

        assertEquals(listOf(YearMonth.of(2024, 2)), report.months.map { it.yearMonth })
        assertNumber("4000", report.total.cost)
        assertNumber("0", report.total.revenue)
    }

    @Test
    fun `contract that starts halfway a month costs part of the salary`() {
        val person = createHelper.createPersonEntity()
        createHelper.createContractInternal(person, LocalDate.of(2024, 4, 16), LocalDate.of(2024, 4, 30))

        val month =
            personReportService
                .personReport(person = person)
                .single()
                .months
                .single()

        assertNumber("2000", month.figures.cost)
        assertNumber("88", month.figures.contractHours)
    }

    @Test
    fun `external person costs the hourly rate for the hours worked`() {
        val person = createHelper.createPersonEntity()
        val client = createHelper.createClient()
        createHelper.createContractExternal(person, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31))
        val assignment = createHelper.createAssignment(client, person, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31))
        createHelper.createWorkDay(assignment, LocalDate.of(2024, 1, 8), LocalDate.of(2024, 1, 12))

        val month =
            personReportService
                .personReport(person = person)
                .single()
                .months
                .single()

        assertEquals(setOf(ContractType.EXTERNAL), month.contractTypes)
        assertNumber("3000", month.figures.cost)
        assertNumber("3200", month.figures.revenue)
        assertNumber("200", month.figures.margin)
    }

    @Test
    fun `report without person has every person with data`() {
        val first = createInternalPerson()
        val second = createInternalPerson()

        val persons = personReportService.personReport().map { it.person }

        assertTrue(persons.containsAll(listOf(first, second)))
    }
}
