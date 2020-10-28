package community.flock.eco.workday.model

import java.math.BigDecimal

data class AggregationMonth(
    val yearMonth: String,
    val countContractInternal: Int,
    val forecastRevenueGross: BigDecimal,
    val forecastRevenueNet: BigDecimal,
    val forecastHoursGross: BigDecimal,
    val actualRevenue: BigDecimal,
    val actualHours: BigDecimal,
    val actualCostContractInternal: BigDecimal,
    val actualCostContractExternal: BigDecimal,
    val actualCostContractManagement: BigDecimal,
    val actualCostContractService: BigDecimal,
    val actualRevenueInternal: BigDecimal,
    val actualRevenueExternal: BigDecimal,
    val countContractExternal: Int
)
