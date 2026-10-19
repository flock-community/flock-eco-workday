package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.PersonPhoto
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PersonPhotoRepository : JpaRepository<PersonPhoto, Long> {
    fun findAllByPersonIdIn(personIds: Collection<Long>): List<PersonPhoto>
}
