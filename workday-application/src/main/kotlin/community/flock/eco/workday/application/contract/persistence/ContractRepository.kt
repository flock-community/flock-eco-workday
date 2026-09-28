package community.flock.eco.workday.application.contract.persistence

import community.flock.eco.workday.application.contract.model.Contract
import community.flock.eco.workday.application.contract.model.ContractType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
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

    @Query("SELECT c FROM Contract c WHERE c.from <= :to AND (c.to is null OR c.to >= :from)")
    fun findAllActive(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
    ): List<Contract>

    @Query("SELECT c FROM Contract c WHERE c.from <= :to AND (c.to is null OR c.to >= :from) AND c.person.uuid = :personCode")
    fun findAllActiveByPerson(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
        @Param("personCode") personCode: UUID,
    ): List<Contract>
}
