package community.flock.eco.workday.forms

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import community.flock.eco.workday.interfaces.DayForm
import java.time.LocalDate

data class EventForm(

    val description: String,

    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val from: LocalDate,

    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val to: LocalDate,

    override val hours: Int,

    override val days: List<Int>,

    val personCodes: List<String>

): DayForm