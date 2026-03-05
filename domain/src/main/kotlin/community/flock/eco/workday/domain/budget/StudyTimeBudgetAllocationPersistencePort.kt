package community.flock.eco.workday.domain.budget

interface StudyTimeBudgetAllocationPersistencePort {
    fun create(allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation

    fun findById(id: Long): StudyTimeBudgetAllocation?

    fun updateIfExists(
        id: Long,
        allocation: StudyTimeBudgetAllocation,
    ): StudyTimeBudgetAllocation?
}
