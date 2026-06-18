package community.flock.eco.workday.domain.budget

interface TimeAllocationPersistencePort {
    fun create(allocation: TimeAllocation): TimeAllocation

    fun findByCode(code: String): TimeAllocation?

    fun updateByCode(
        code: String,
        allocation: TimeAllocation,
    ): TimeAllocation?
}
