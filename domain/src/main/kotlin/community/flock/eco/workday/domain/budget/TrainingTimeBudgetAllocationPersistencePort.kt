package community.flock.eco.workday.domain.budget

interface TrainingTimeBudgetAllocationPersistencePort {
    fun create(allocation: TrainingTimeBudgetAllocation): TrainingTimeBudgetAllocation

    fun findById(id: Long): TrainingTimeBudgetAllocation?

    fun updateIfExists(
        id: Long,
        allocation: TrainingTimeBudgetAllocation,
    ): TrainingTimeBudgetAllocation?
}
