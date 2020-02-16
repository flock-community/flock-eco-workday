package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.AggregationService
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
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
    fun revenuePerMonthByYear(@RequestParam year: Int): Map<YearMonth, Double> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.revenuePerMonth(from, to)
    }

    @GetMapping("/cost-per-month", params = ["year"])
    fun costPerMonthByYear(@RequestParam year: Int): Map<YearMonth, BigDecimal> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.costPerMonth(from, to)
    }

    @GetMapping("/person-per-month", params = ["year"])
    fun personPerMonthByYear(@RequestParam year: Int): Map<YearMonth, BigDecimal> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.costPerMonth(from, to)
    }
}
