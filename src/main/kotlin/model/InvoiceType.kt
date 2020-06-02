package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.Id


enum class InvoiceType {
    EXPENSE
}
