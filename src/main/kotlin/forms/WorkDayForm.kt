package community.flock.eco.workday.forms

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import community.flock.eco.workday.interfaces.Approve
import community.flock.eco.workday.interfaces.Dayly
import community.flock.eco.workday.model.Status
import java.time.LocalDate
import java.util.UUID

data class WorkDayForm(
    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val from: LocalDate,
    @JsonDeserialize(using = LocalDateDeserializer::class)
    @JsonSerialize(using = LocalDateSerializer::class)
    override val to: LocalDate,
    override val hours: Double,
    override val days: List<Double>? = null,
    override val status: Status = Status.REQUESTED,
    val assignmentCode: String,
    val sheets: List<WorkDaySheetForm>,
) : Dayly, Approve

data class WorkDaySheetForm(
    val name: String,
    val file: UUID,
)
