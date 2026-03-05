package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.ManyToOne
import java.time.LocalDate
import java.util.UUID

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
abstract class BudgetAllocationEntity(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    @ManyToOne(fetch = FetchType.EAGER)
    open val person: Person?,
    open val eventCode: String? = null,
    open val date: LocalDate,
    open val description: String? = null,
) : AbstractCodeEntity(id, code)
