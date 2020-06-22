package community.flock.eco.workday.model

import java.math.BigDecimal

data class AggregationPerson(
    val name: String,
    val contractTypes: Set<String>,
    val sickDays:BigDecimal,
    val workDays:BigDecimal,
    val assignment:Int,
    val event:Int,
    val total:Int,
    val holiDayUsed:BigDecimal,
    val holiDayBalance:BigDecimal,
    val revenue:BigDecimal
)
