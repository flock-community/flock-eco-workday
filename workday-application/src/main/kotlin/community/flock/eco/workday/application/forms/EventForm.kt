package community.flock.eco.workday.application.forms

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import community.flock.eco.workday.application.interfaces.Daily
import community.flock.eco.workday.application.model.EventType
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

data class EventForm(
    val description: String,
    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val from: LocalDate,
    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val to: LocalDate,
    override val hours: Double,
    override val days: MutableList<Double>,
    val costs: Double,
    val personIds: List<UUID>,
    // When non-empty, takes precedence over personIds as the source of truth for membership, hours and cost.
    val participants: List<EventDayInput> = emptyList(),
    val type: EventType,
) : Daily

data class EventDayInput(
    val personId: UUID,
    val hours: Double,
    val cost: BigDecimal? = null,
)
