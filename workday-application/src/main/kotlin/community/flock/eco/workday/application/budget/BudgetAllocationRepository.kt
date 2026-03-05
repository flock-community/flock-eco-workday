package community.flock.eco.workday.application.budget

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface BudgetAllocationRepository : JpaRepository<BudgetAllocationEntity, Long> {
    @Query(
        "SELECT ba FROM BudgetAllocationEntity ba WHERE ba.person.uuid = :personUuid AND YEAR(ba.date) = :year",
    )
    fun findAllByPersonUuidAndYear(
        personUuid: UUID,
        year: Int,
    ): List<BudgetAllocationEntity>

    fun findAllByEventCode(eventCode: String): List<BudgetAllocationEntity>

    fun findByCode(code: String): BudgetAllocationEntity?
}

@Repository
interface HackTimeBudgetAllocationRepository : CrudRepository<HackTimeBudgetAllocationEntity, Long>

@Repository
interface StudyTimeBudgetAllocationRepository : CrudRepository<StudyTimeBudgetAllocationEntity, Long>

@Repository
interface StudyMoneyBudgetAllocationRepository : CrudRepository<StudyMoneyBudgetAllocationEntity, Long>