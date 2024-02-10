package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.ObjectIdGenerators
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
class SickDay(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),
    override val hours: Double,
    @ElementCollection
    override val days: List<Double>? = null,
    val description: String? = null,
    @Enumerated(EnumType.STRING)
    override val status: Status,
    @ManyToOne
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "uuid")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("personId")
    val person: Person,
) : Day(id, code, from, to, hours, days), Approve
