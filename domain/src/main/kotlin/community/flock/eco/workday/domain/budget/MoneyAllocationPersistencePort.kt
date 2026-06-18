package community.flock.eco.workday.domain.budget

interface MoneyAllocationPersistencePort {
    fun create(allocation: MoneyAllocation): MoneyAllocation

    fun findByCode(code: String): MoneyAllocation?

    fun updateByCode(
        code: String,
        allocation: MoneyAllocation,
    ): MoneyAllocation?
}
