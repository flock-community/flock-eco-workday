package community.flock.eco.workday.application.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.interfaces.Approve
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.ManyToOne
import java.time.LocalDate
import java.util.UUID

enum class LeaveDayType {
    HOLIDAY,
    PLUSDAY,
    PAID_PARENTAL_LEAVE,
    UNPAID_PARENTAL_LEAVE,
    PAID_LEAVE,
}

@Entity
@EntityListeners(EventEntityListeners::class)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
class LeaveDay(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    from: LocalDate = LocalDate.now(),
    to: LocalDate = LocalDate.now(),
    hours: Double,
    days: MutableList<Double>? = null,
    val description: String,
    @Enumerated(EnumType.STRING)
    val type: LeaveDayType,
    @Enumerated(EnumType.STRING)
    override val status: Status,
    @ManyToOne
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "uuid")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("personId")
    val person: Person,
) : Day(id, code, from, to, hours, days),
    Approve
