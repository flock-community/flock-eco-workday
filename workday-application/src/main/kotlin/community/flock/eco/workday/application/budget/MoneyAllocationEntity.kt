package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.CollectionTable
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "money_allocation")
class MoneyAllocationEntity(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    @ManyToOne(fetch = FetchType.EAGER)
    val person: Person,
    val eventCode: String? = null,
    val date: LocalDate,
    val description: String? = null,
    val amount: BigDecimal,
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "money_allocation_files",
        joinColumns = [JoinColumn(name = "money_allocation_id")],
    )
    val files: MutableList<Document> = mutableListOf(),
) : AbstractCodeEntity(id, code)
