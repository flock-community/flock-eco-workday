package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
data class Invoice(
    @Id
    val id: UUID = UUID.randomUUID(),
    val description: String,
    val reference: UUID,
    val amount: Double,
    @Enumerated(EnumType.STRING)
    val type: InvoiceType,
    @Enumerated(EnumType.STRING)
    val status: InvoiceStatus,
    @ElementCollection
    val documents: List<Document> = listOf(),
)
