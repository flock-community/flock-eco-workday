package community.flock.eco.workday.model

import java.math.BigDecimal

data class AggregationClient(
    val name: String,
    val revenueGross: BigDecimal,
)

data class AggregationIdentifier(
    val id: String,
    val name: String,
)
