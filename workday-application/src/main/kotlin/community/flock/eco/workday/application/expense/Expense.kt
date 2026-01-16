package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.domain.common.Approve
import community.flock.eco.workday.domain.common.Status
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.ManyToOne
import java.time.LocalDate
import java.util.UUID

@Entity
@Inheritance(
    strategy = InheritanceType.JOINED,
)
@EntityListeners(EventEntityListeners::class)
abstract class Expense(
    @Id
    open val id: UUID = UUID.randomUUID(),
    open val date: LocalDate = LocalDate.now(),
    open val description: String? = null,
    @ManyToOne(fetch = FetchType.EAGER)
    open val person: Person,
    @Enumerated(EnumType.STRING)
    val status: Status = Status.REQUESTED,
    @Enumerated(EnumType.STRING)
    open val type: ExpenseType,
)
