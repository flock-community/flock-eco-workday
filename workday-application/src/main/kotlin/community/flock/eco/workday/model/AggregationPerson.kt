package community.flock.eco.workday.model

import java.math.BigDecimal
import java.util.UUID

data class AggregationPersonClientRevenueOverview(
    val clients: List<AggregationPersonClientRevenueItem>,
    val total: BigDecimal,
)

data class AggregationPersonClientRevenueItem(
    val client: AggregationIdentifier,
    val revenue: BigDecimal,
)

data class AggregationClientPersonOverview(
    val client: AggregationIdentifier,
    val aggregationPerson: List<AggregationClientPersonItem>,
    val totals: List<Float>,
)

data class AggregationClientPersonItem(
    val person: AggregationIdentifier,
    val hours: List<Float>,
    val total: Float,
)

data class AggregationClientPersonAssignmentItem(
    val person: AggregationIdentifier,
    val assignment: AggregationIdentifier,
    val hours: List<Float>,
    val total: Float,
)

data class AggregationClientPersonAssignmentOverview(
    val client: AggregationIdentifier,
    val aggregationPersonAssignment: List<AggregationClientPersonAssignmentItem>,
    val totals: List<Float>,
)

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
