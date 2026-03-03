package community.flock.eco.workday.domain.budget

interface HackTimeBudgetAllocationPersistencePort {
    fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation
    fun findById(id: Long): HackTimeBudgetAllocation?
    fun updateIfExists(id: Long, allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation?
}
