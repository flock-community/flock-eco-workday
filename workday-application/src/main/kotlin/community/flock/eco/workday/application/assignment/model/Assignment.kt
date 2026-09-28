package community.flock.eco.workday.application.assignment.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import community.flock.eco.workday.application.client.model.Client
import community.flock.eco.workday.application.common.model.Hourly
import community.flock.eco.workday.application.common.model.Period
import community.flock.eco.workday.application.person.model.Person
import community.flock.eco.workday.application.project.model.Project
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.ManyToOne
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
data class Assignment(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    val role: String? = null,
    override val from: LocalDate,
    override val to: LocalDate?,
    override val hourlyRate: Double,
    override val hoursPerWeek: Int,
    @ManyToOne
    val client: Client,
    @ManyToOne
    val person: Person,
    @ManyToOne
    @JsonIgnoreProperties("assignments")
    val project: Project? = null,
) : AbstractCodeEntity(id, code),
    Hourly,
    Period {
    override fun amountPerWorkingDay(month: YearMonth): BigDecimal =
        (hourlyRate * hoursPerWeek)
            .toBigDecimal()
            .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
}
