package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonTypeInfo
import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.Inheritance
import javax.persistence.InheritanceType

@Entity
@EntityListeners(EventEntityListeners::class)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
class TravelExpense(

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    val distance: Double

) : Expense(id, code)
