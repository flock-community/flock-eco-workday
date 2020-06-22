package community.flock.eco.workday.model

import java.math.BigDecimal

data class AggregationClient(
    val name: String,
    val revenueGross: BigDecimal
)
