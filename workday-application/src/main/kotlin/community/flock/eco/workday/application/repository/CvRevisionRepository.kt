package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.CvRevision
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

/** When a revision was saved, without its content: what the list of revisions shows. */
interface CvRevisionSummary {
    val id: UUID
    val savedAt: Instant
}

/** What a revision held and when it was saved, without the CV (and the person and photo) it belongs to. */
interface CvRevisionContent {
    val savedAt: Instant
    val content: String
}

@Repository
interface CvRevisionRepository : JpaRepository<CvRevision, UUID> {
    fun findAllByCvCodeOrderBySavedAtDesc(code: String): List<CvRevisionSummary>

    fun findFirstByCvCodeOrderBySavedAtDesc(code: String): CvRevision?

    fun findByIdAndCvCode(
        id: UUID,
        code: String,
    ): CvRevision?

    @Query("select r.savedAt as savedAt, r.content as content from CvRevision r where r.id = :id and r.cv.code = :code")
    fun findContentByIdAndCvCode(
        id: UUID,
        code: String,
    ): CvRevisionContent?
}
