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
    
    @GetMapping("/total-per-client", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun revenuePerClientByYear(@RequestParam year: Int): List<Map<String, Any>> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerClient(from, to)
    }

    @GetMapping("/total-per-person", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerPersonByYear(@RequestParam year: Int): List<Map<String, Any>> {
        val from = LocalDate.of(year, 1,1)
        val to = LocalDate.of(year, 12,31)
        return aggregationService.totalPerPerson(from, to)
    }

    @GetMapping("/total-per-person", params = ["year", "month"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerPersonByYearMonth(@RequestParam year: Int, @RequestParam month: Int): List<Map<String, Any>> {
        val yearMonth = YearMonth.of(year, month)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        return aggregationService.totalPerPerson(from, to)
    }

    @GetMapping("/total-per-month", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerMonthByYear(@RequestParam year: Int): List<Map<String, Any>> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerMonth(from, to)
    }
}
