package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonClassDescription
import com.fasterxml.jackson.annotation.JsonTypeInfo
import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.ManyToOne

@Entity
@EntityListeners(EventEntityListeners::class)
class TravelExpense(

    override val id: UUID = UUID.randomUUID(),
    override val date: LocalDate = LocalDate.now(),
    override val description: String? = null,

    override val person: Person,
    override val status: Status = Status.REQUESTED,

    val distance: Double,
    val allowance: Double

) : Expense(id, date, description, person, status, ExpenseType.TRAVEL)