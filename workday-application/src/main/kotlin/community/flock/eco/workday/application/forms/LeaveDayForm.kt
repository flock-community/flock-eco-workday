package community.flock.eco.workday.application.forms

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import community.flock.eco.workday.application.interfaces.Daily
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.interfaces.Approve
import java.time.LocalDate
import java.util.UUID

data class LeaveDayForm(
    val description: String,
    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val from: LocalDate,
    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val to: LocalDate,
    override val hours: Double,
    override val days: MutableList<Double>?,
    override val status: Status = Status.REQUESTED,
    val type: LeaveDayType = LeaveDayType.HOLIDAY,
    val personId: UUID,
) : Daily,
    Approve
