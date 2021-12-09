package utils

import community.flock.eco.workday.utils.DateUtils.countWorkDaysInMonth
import community.flock.eco.workday.utils.DateUtils.dateRange
import community.flock.eco.workday.utils.DateUtils.isWorkingDay
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.YearMonth
import kotlin.test.assertEquals

class DateUtilsTest {

    @Test
    fun `creates date range between two dates`() {
        val result = dateRange(LocalDate.of(2021, 12, 8), LocalDate.of(2021, 12, 12))
        val expected = listOf(
            LocalDate.of(2021, 12, 8),
            LocalDate.of(2021, 12, 9),
            LocalDate.of(2021, 12, 10),
            LocalDate.of(2021, 12, 11),
            LocalDate.of(2021, 12, 12)
        )
        assertEquals(result, expected)
    }

    @Test
    fun `creates date range between the same date`() {
        val result = dateRange(LocalDate.of(2021, 12, 8), LocalDate.of(2021, 12, 8))
        val expected = listOf(
            LocalDate.of(2021, 12, 8),
        )
        assertEquals(result, expected)
    }

    @Test
    fun `should return false when day is not a working day`() {
        val notWorkingDay = LocalDate.of(2021, 12, 5)
        assertEquals(false, notWorkingDay.isWorkingDay())
    }

    @Test
    fun `should return true when date is a working day`() {
        val notWorkingDay = LocalDate.of(2021, 12, 6)
        assertEquals(true, notWorkingDay.isWorkingDay())
    }

    @Test
    fun `should count working days in a yearMonth`() {
        val yearMonth = YearMonth.of(2021, 12)
        assertEquals(23, yearMonth.countWorkDaysInMonth())
    }

    @Test
    fun `should count working days in the month of given localDate`() {
        val localDate = LocalDate.of(2021, 12, 1)
        assertEquals(23, localDate.countWorkDaysInMonth())
    }
}
