package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.Id


@Entity
@EntityListeners(EventEntityListeners::class)
class Invoice (

    @Id
    val id: UUID = UUID.randomUUID(),
    val description:String,
    val type:InvoiceType,
    val reference: UUID,
    val amount:Double,

    @ElementCollection
    val documents: List<Document> = listOf()

)
