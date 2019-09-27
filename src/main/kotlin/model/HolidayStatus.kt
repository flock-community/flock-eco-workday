package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.core.model.AbstractIdEntity
import java.util.*
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.ManyToOne
import javax.persistence.OneToMany

enum class HolidayStatus{
    REQUESTED,
    APPROVED,
    REJECTED
}

