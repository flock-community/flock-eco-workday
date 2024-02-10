package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.workday.interfaces.Hourly
import community.flock.eco.workday.interfaces.Period
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.ManyToOne

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
) : Hourly, Period, AbstractCodeEntity(id, code)
