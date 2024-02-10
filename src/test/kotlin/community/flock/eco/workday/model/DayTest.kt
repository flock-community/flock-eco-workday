package community.flock.eco.workday.model

import community.flock.eco.workday.utils.DateUtils
import org.junit.jupiter.api.Test
import java.time.LocalDate
import kotlin.test.assertEquals

class DayTest {
    val startDate: LocalDate = LocalDate.of(2021, 12, 1)
    val endDate: LocalDate = LocalDate.of(2021, 12, 5)

    @Test
    fun `hours per day with missing days`() {
        val day = object : Day(id = 0L, hours = 24.0, from = startDate, to = endDate) {}
        val dates = day.toDateRange()
        val dayToHour = day.hoursPerDayInPeriod(startDate, endDate)
        val resultHours = dayToHour.map { it.value }.map { it.toDouble() }
        val resultDays = dayToHour.keys.toList()

        assertEquals(listOf(8.0, 8.0, 8.0, 0.0, 0.0), resultHours)
        assertEquals(dates, resultDays)
    }

    @Test
    fun `hours per day when period differs from day range`() {
        val days = listOf(1.0, 2.0, 3.0, 0.0, 0.0)
        val day = object : Day(id = 0L, hours = 6.0, from = startDate, to = endDate, days = days) {}
        val dates = DateUtils.dateRange(startDate.minusDays(2), endDate.plusDays(2))
        val dayToHours = day.hoursPerDayInPeriod(startDate.minusDays(2), endDate.plusDays(2))
        val resultHours = dayToHours.map { it.value }.map { it.toDouble() }
        val resultDays = dayToHours.keys.toList()

        assertEquals(listOf(0.0, 0.0, 1.0, 2.0, 3.0, 0.0, 0.0, 0.0, 0.0), resultHours)
        assertEquals(dates, resultDays)
    }

    @Test
    fun `hours per day when period differs from day range with missing days`() {
        val day = object : Day(id = 0L, hours = 12.0, from = startDate, to = endDate) {}
        val dates = DateUtils.dateRange(startDate.minusDays(2), endDate.plusDays(2))
        val dayToHours = day.hoursPerDayInPeriod(startDate.minusDays(2), endDate.plusDays(2))
        val resultHours = dayToHours.map { it.value }.map { it.toDouble() }
        val resultDays = dayToHours.keys.toList()

        assertEquals(listOf(0.0, 0.0, 4.0, 4.0, 4.0, 0.0, 0.0, 0.0, 0.0), resultHours)
        assertEquals(dates, resultDays)
    }

    @Test
    fun `hours per day when day ranges between different months`() {
        val days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0)
        val day = object : Day(id = 0L, hours = 56.0, from = startDate.minusDays(2), to = endDate.plusDays(2), days = days) {}
        val dates = DateUtils.dateRange(startDate, endDate.plusDays(2))
        val dayToHours = day.hoursPerDayInPeriod(startDate, endDate.plusDays(2))
        val resultHours = dayToHours.map { it.value }.map { it.toDouble() }
        val resultDays = dayToHours.keys.toList()

        assertEquals(listOf(8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0), resultHours)
        assertEquals(dates, resultDays)
    }

    @Test
    fun `hours per day when day ranges between different months with missing days`() {
        val day = object : Day(id = 0L, hours = 56.0, from = startDate.minusDays(2), to = endDate.plusDays(2)) {}
        val dates = DateUtils.dateRange(startDate, endDate.plusDays(2))
        val dayToHours = day.hoursPerDayInPeriod(startDate, endDate.plusDays(2))
        val resultHours = dayToHours.map { it.value }.map { it.toDouble() }
        val resultDays = dayToHours.keys.toList()

        assertEquals(listOf(8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0), resultHours)
        assertEquals(dates, resultDays)
    }
}
