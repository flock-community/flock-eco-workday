package community.flock.eco.workday.application.budget

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface TimeAllocationRepository : JpaRepository<TimeAllocationEntity, Long> {
    @Query(
        "SELECT ta FROM TimeAllocationEntity ta WHERE ta.person.uuid = :personUuid AND YEAR(ta.date) = :year",
    )
    fun findAllByPersonUuidAndYear(
        personUuid: UUID,
        year: Int,
    ): List<TimeAllocationEntity>

    fun findAllByEventCode(eventCode: String): List<TimeAllocationEntity>

    fun findByCode(code: String): TimeAllocationEntity?
}

@Repository
interface MoneyAllocationRepository : JpaRepository<MoneyAllocationEntity, Long> {
    @Query(
        "SELECT ma FROM MoneyAllocationEntity ma WHERE ma.person.uuid = :personUuid AND YEAR(ma.date) = :year",
    )
    fun findAllByPersonUuidAndYear(
        personUuid: UUID,
        year: Int,
    ): List<MoneyAllocationEntity>

    fun findAllByEventCode(eventCode: String): List<MoneyAllocationEntity>

    fun findByCode(code: String): MoneyAllocationEntity?
}
