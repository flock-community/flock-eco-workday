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
    val actualTotalHours: AggregationDaily
)

data class AggregationDaily(
    val workDay: BigDecimal,
    val leaveDay: BigDecimal,
    val sickDay: BigDecimal,
    val eventDay: BigDecimal
)
