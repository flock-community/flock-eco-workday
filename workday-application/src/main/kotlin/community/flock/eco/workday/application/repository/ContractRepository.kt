package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Contract
import community.flock.eco.workday.application.model.ContractType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@Repository
interface ContractRepository : JpaRepository<Contract, Long> {
    fun findByCode(code: String): Optional<Contract>

    fun findAllByPersonUuid(
        personUuid: UUID,
        page: Pageable,
    ): Page<Contract>

    fun findAllByPersonUserCode(
        userCode: String,
        page: Pageable,
    ): Page<Contract>

    fun deleteByCode(code: String)

    fun findAllByType(internal: ContractType): Iterable<Contract>

    fun findAllByToBetween(
        start: LocalDate?,
        end: LocalDate?,
    ): Iterable<Contract>

    fun findAllByToAfterOrToNull(
        to: LocalDate?,
        page: Pageable,
    ): Page<Contract>
}
