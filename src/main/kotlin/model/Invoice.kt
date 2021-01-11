package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id

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
    val documents: List<Document> = listOf()

)
