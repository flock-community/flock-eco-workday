package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
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

    @ManyToOne
    open val person: Person,

    @Enumerated(EnumType.STRING)
    open val status: Status = Status.REQUESTED

)
