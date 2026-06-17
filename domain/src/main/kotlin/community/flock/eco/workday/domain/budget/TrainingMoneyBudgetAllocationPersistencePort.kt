package community.flock.eco.workday.domain.budget

interface TrainingMoneyBudgetAllocationPersistencePort {
    fun create(allocation: TrainingMoneyBudgetAllocation): TrainingMoneyBudgetAllocation

    fun findById(id: Long): TrainingMoneyBudgetAllocation?

    fun updateIfExists(
        id: Long,
        allocation: TrainingMoneyBudgetAllocation,
    ): TrainingMoneyBudgetAllocation?
}
