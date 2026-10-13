package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.CvRevision
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CvRevisionRepository : JpaRepository<CvRevision, UUID> {
    fun findAllByCvCodeOrderBySavedAtDesc(code: String): List<CvRevision>

    fun findByIdAndCvCode(
        id: UUID,
        code: String,
    ): CvRevision?
}
