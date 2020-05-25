package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Inheritance
import javax.persistence.InheritanceType

@Entity
@Inheritance(
    strategy = InheritanceType.JOINED
)
@EntityListeners(EventEntityListeners::class)
abstract class Expense(

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    open val date: LocalDate = LocalDate.now(),

    @Enumerated(EnumType.STRING)
    open val status: Status = Status.REQUESTED

) : AbstractCodeEntity(id, code)
