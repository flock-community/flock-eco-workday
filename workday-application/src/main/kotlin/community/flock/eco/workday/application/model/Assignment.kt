package community.flock.eco.workday.application.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import community.flock.eco.workday.application.interfaces.Hourly
import community.flock.eco.workday.application.interfaces.Period
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.ManyToOne
import java.time.LocalDate
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
    Period
