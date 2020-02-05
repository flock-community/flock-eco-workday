package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

enum class ContractType{
    INTERNAL,
    EXTERNAL
}

