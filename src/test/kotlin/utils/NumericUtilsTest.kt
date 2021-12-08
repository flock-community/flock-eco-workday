package utils

import community.flock.eco.workday.model.Day
import community.flock.eco.workday.utils.NumericUtils.calculateRevenue
import community.flock.eco.workday.utils.NumericUtils.sum
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.test.assertEquals

class NumericUtilsTest {

    val startDate = LocalDate.of(2021, 12, 1)
    val endDate = LocalDate.of(2021, 12, 5)

    @Test
    fun `calculate revenue `() {
        val days = listOf(1.0, 2.0, 3.5, 0.0, 0.0)
        val day = object : Day(id = 0L, hours = 6.5, from = startDate, to = endDate, days = days) {}
        val revenue = day.hoursPerDayInPeriod(startDate, endDate).calculateRevenue(421.12)
        assertEquals(2737.280F, revenue)
    }

    @Test
    fun `calculate revenue with missing days`() {
        val day = object : Day(id = 0L, hours = 24.0, from = startDate, to = endDate) {}
        val revenue = day.hoursPerDayInPeriod(startDate, endDate).calculateRevenue(80.0)
        assertEquals(1920.00000000000F, revenue)
    }

    @Test
    fun `calculate revenue with missing days and uncommon amount of hours`() {
        val day = object : Day(id = 0L, hours = 24.69, from = startDate, to = endDate) {}
        val revenue = day.hoursPerDayInPeriod(startDate, endDate).calculateRevenue(12.34)
        assertEquals(BigDecimal("304.674600000000"), revenue)
    }

    @Test
    fun `calculate sum of list of BigDecimals`() {
        val sum = listOf(BigDecimal("123.05"), BigDecimal("31341.50"), BigDecimal("1.57")).asIterable().sum()
        assertEquals(BigDecimal("31466.12"), sum)
    }
}
