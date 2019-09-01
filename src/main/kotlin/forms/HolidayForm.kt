package community.flock.eco.workday.forms

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import community.flock.eco.workday.model.Type
import java.time.LocalDate

data class HolidayForm(

        val description: String?,

        @JsonDeserialize(using = LocalDateDeserializer::class)
        @JsonSerialize(using = LocalDateSerializer::class)
        val from: LocalDate,

        @JsonDeserialize(using = LocalDateDeserializer::class)
        @JsonSerialize(using = LocalDateSerializer::class)
        val to: LocalDate,

        val type: Type,

        val dayOff: Array<Int>,

        val userCode: String?
)
