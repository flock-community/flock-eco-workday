package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.model.Person
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

    /** Makes every other CV of [person] in [language] a copy of [base]. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(
        """
        update Cv c set c.base = false, c.basedOn = :base, c.basedOnUpdatedAt = null
        where c.person = :person and c.language = :language and c.id <> :id
        """,
    )
    fun makeCopiesOf(
        base: Cv,
        person: Person,
        language: CvLanguage,
        id: Long,
    )

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Cv c set c.base = true, c.basedOn = null, c.basedOnUpdatedAt = null where c.id = :id")
    fun makeBase(id: Long)
}
