package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Cv
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

    /** The base CVs with an assignment whose client contains [client], ignoring case. */
    @Query(
        "select distinct c from Cv c join c.experiences e " +
            "where c.base = true and lower(e.client) like lower(concat('%', :client, '%'))",
    )
    fun findAllBaseByExperienceClient(client: String): List<Cv>

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
