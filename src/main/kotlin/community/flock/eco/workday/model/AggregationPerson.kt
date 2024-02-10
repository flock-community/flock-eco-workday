package community.flock.eco.workday.model

import community.flock.eco.workday.graphql.kotlin.AggregationPersonClientRevenueOverview
import java.math.BigDecimal
import java.util.UUID

data class AggregationPerson(
    val id: UUID,
    val name: String,
    val contractTypes: Set<String>,
    val sickDays: BigDecimal,
    val workDays: BigDecimal,
    val assignment: Int,
    val event: Int,
    val total: Int,
    val leaveDayUsed: BigDecimal,
    val leaveDayBalance: BigDecimal,
    val paidParentalLeaveUsed: BigDecimal,
    val unpaidParentalLeaveUsed: BigDecimal,
    val revenue: AggregationPersonClientRevenueOverview? = null,
    val cost: BigDecimal? = null,
)
