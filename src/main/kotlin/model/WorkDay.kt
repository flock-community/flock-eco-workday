package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonTypeInfo
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Approve
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.ManyToOne

@Entity
@EntityListeners(EventEntityListeners::class)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
class WorkDay(

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),

    override val hours: Double,

    @ElementCollection
    override val days: List<Double>? = null,

    @ManyToOne
    val assignment: Assignment,

    @Enumerated(EnumType.STRING)
    override val status: Status,

    @ElementCollection
    val sheets: List<WorkDaySheet>

) : Day(id, code, from, to, hours, days), Approve
