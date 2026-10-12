package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Cv
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
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
}
