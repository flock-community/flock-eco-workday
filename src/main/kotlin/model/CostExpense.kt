package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonTypeInfo
import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
class CostExpense(

    override val id: UUID = UUID.randomUUID(),
    override val date: LocalDate = LocalDate.now(),

    override val description: String? = null,

    override val person: Person,
    override val status: Status = Status.REQUESTED,

    val amount: Double,

    @ElementCollection
    val files: List<Document> = listOf()

) : Expense(id, date, description, person, status)
