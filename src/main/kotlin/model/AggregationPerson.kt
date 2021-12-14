package community.flock.eco.workday.model

import community.flock.eco.workday.graphql.AggregationPersonClientRevenueOverview
import java.math.BigDecimal
import java.util.*

data class AggregationPerson(
    val id: UUID,
    val name: String,
    val contractTypes: Set<String>,
    val sickDays: BigDecimal,
    val workDays: BigDecimal,
    val assignment: Int,
    val event: Int,
    val total: Int,
    val holiDayUsed: BigDecimal,
    val holiDayBalance: BigDecimal,
    val revenue: AggregationPersonClientRevenueOverview?,
    val cost: BigDecimal?
)
