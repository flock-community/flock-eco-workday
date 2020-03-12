package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.AggregationService
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/aggregations")
class AggregationController(
    val aggregationService: AggregationService
) {

    @GetMapping("/revenue-per-month", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun revenuePerMonthByYear(@RequestParam year: Int): Map<YearMonth, BigDecimal> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.revenuePerMonth(from, to)
    }

    @GetMapping("/cost-per-month", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun costPerMonthByYear(@RequestParam year: Int): Map<YearMonth, BigDecimal> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.costPerMonth(from, to)
    }

    @GetMapping("/person-per-month", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun personPerMonthByYear(@RequestParam year: Int): Map<YearMonth, BigDecimal> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.costPerMonth(from, to)
    }

    @GetMapping("/holiday-per-person", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun holiDayPerPersonByYear(@RequestParam year: Int): Map<String, Double> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.holidayPerPerson(from, to)
    }

    @GetMapping("/sickday-per-person", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun sickDayPerPersonByYear(@RequestParam year: Int): Map<String, Double> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.sickDayPerPerson(from, to)
    }

    @GetMapping("/work-day-per-person", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun workDayPerPersonByYear(@RequestParam year: Int): Map<String, Double> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.workDayPerPerson(from, to)
    }


    @GetMapping("/revenue-per-client", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun revenuePerClientByYear(@RequestParam year: Int): Map<String, BigDecimal> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.revenuePerClient(from, to)
    }

    @GetMapping("/total-per-person", params = ["year", "month"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerPersonByYear(@RequestParam year: Int, @RequestParam month: Int): List<Map<String, Any>> {
        val yearMonth = YearMonth.of(year, month)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        return aggregationService.totalPerPerson(from, to)
    }
}
