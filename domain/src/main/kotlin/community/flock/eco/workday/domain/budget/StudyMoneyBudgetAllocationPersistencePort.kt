package community.flock.eco.workday.domain.budget

interface StudyMoneyBudgetAllocationPersistencePort {
    fun create(allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation
    fun findById(id: Long): StudyMoneyBudgetAllocation?
    fun updateIfExists(id: Long, allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation?
}
