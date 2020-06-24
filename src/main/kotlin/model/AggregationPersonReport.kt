package community.flock.eco.workday.model

import java.math.BigDecimal
import java.time.LocalDate

data class AggregationPersonReport(
    val name: String,
    val startDate: LocalDate,
    val month: Iterable<AggregationPersonReportMonth>
)

data class AggregationPersonReportMonth(
    val name: String,
    val actualTotalHours: AggregationDayly
)

data class AggregationDayly(
    val workDay:BigDecimal,
    val holiDay:BigDecimal,
    val sickDay:BigDecimal,
    val eventDay:BigDecimal
)
