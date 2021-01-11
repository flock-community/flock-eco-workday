package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Approve
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.ManyToOne

@Entity
@Inheritance(
    strategy = InheritanceType.JOINED
)
@EntityListeners(EventEntityListeners::class)
abstract class Expense(

    @Id
    open val id: UUID = UUID.randomUUID(),

    open val date: LocalDate = LocalDate.now(),
    open val description: String? = null,

    @ManyToOne
    open val person: Person,

    @Enumerated(EnumType.STRING)
    override val status: Status = Status.REQUESTED,

    @Enumerated(EnumType.STRING)
    open val type: ExpenseType

) : Approve
