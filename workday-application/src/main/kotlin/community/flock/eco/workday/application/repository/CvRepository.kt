package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CvRepository : JpaRepository<Cv, Long> {
    fun findByCode(code: String): Cv?

    fun findByPersonUuidAndNameIgnoreCase(
        personUuid: UUID,
        name: String,
    ): Cv?

    fun findAllByPersonUuid(
        personUuid: UUID,
        pageable: Pageable,
    ): Page<Cv>

    /**
     * The assignments on base CVs whose client contains [client], ignoring case, newest
     * first and at most a page of them. Only the assignment and the few fields of its CV
     * and person that go with it are read, not the CVs themselves.
     */
    @Query(
        "select new community.flock.eco.workday.application.repository.CvClientExperienceRow(" +
            "c.code, c.language, p.uuid, p.firstname, p.lastname, e) " +
            "from Cv c join c.person p join c.experiences e " +
            "where c.base = true and lower(e.client) like lower(concat('%', :client, '%')) " +
            "order by e.from desc",
    )
    fun findBaseExperiencesByClient(
        client: String,
        pageable: Pageable,
    ): List<CvClientExperienceRow>

    fun deleteByCode(code: String)

    fun findByPersonUuidAndLanguageAndBase(
        personUuid: UUID,
        language: CvLanguage,
        base: Boolean,
    ): Cv?

    fun existsByPersonUuidAndLanguage(
        personUuid: UUID,
        language: CvLanguage,
    ): Boolean

    fun existsByBasedOn(base: Cv): Boolean

    fun findAllByBasedOn(base: Cv): List<Cv>

    fun findAllByPersonUuidAndLanguage(
        personUuid: UUID,
        language: CvLanguage,
    ): List<Cv>

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Cv c set c.base = true, c.basedOn = null, c.basedOnUpdatedAt = null, c.baseSnapshot = null where c.id = :id")
    fun makeBase(id: Long)
}

/** An assignment on a base CV with the CV and person it belongs to; see [CvRepository.findBaseExperiencesByClient]. */
data class CvClientExperienceRow(
    val cvCode: String,
    val language: CvLanguage,
    val personUuid: UUID,
    val firstname: String,
    val lastname: String,
    val experience: CvExperience,
)
