package community.flock.eco.workday.domain.expense

import java.time.LocalDate

enum class RecurrencePeriod {
    NONE,
    WEEK,
    MONTH,
    QUARTER,
    YEAR,
    ;

    fun advance(from: LocalDate): LocalDate =
        when (this) {
            NONE -> from
            WEEK -> from.plusWeeks(1)
            MONTH -> from.plusMonths(1)
            QUARTER -> from.plusMonths(3)
            YEAR -> from.plusYears(1)
        }
}
