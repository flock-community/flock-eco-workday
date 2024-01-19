package community.flock.eco.workday.forms

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import community.flock.eco.workday.interfaces.Dayly
import community.flock.eco.workday.model.EventType
import java.time.LocalDate
import java.util.*

data class EventForm(

    val description: String,

    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val from: LocalDate,

    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val to: LocalDate,

    override val hours: Double,

    override val days: List<Double>,

    val costs: Double,

    val personIds: List<UUID>,

    val type: EventType,

    val billable: Boolean,

) : Dayly
