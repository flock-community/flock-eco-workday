package community.flock.eco.workday.forms

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import community.flock.eco.workday.interfaces.Approve
import community.flock.eco.workday.interfaces.Dayly
import community.flock.eco.workday.model.Status
import java.time.LocalDate

data class SickDayForm(

    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val from: LocalDate,

    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val to: LocalDate,

    override val hours: Double,
    override val days: List<Double>,
    override val status: Status = Status.REQUESTED,

    val description: String? = null,
    val personCode: String

    ) : Dayly, Approve
