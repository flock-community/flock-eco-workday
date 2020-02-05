package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.GraphService
import java.time.LocalDate
import java.time.YearMonth
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/graph")
class GraphController(
    val graphService: GraphService
) {

    @GetMapping("/revenue-per-month", params = ["year"])
    fun revenuePerMonthByYear(@RequestParam year: Int): Map<YearMonth, Double> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return graphService.revenuePerMonth(from, to)
    }
}
