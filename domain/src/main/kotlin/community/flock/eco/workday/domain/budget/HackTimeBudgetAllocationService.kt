package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher

class HackTimeBudgetAllocationService(
    private val repository: HackTimeBudgetAllocationPersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation =
        repository
            .create(allocation)
            .also { applicationEventPublisher.publishEvent(CreateBudgetAllocationEvent(it)) }

    fun update(
        id: Long,
        allocation: HackTimeBudgetAllocation,
    ): HackTimeBudgetAllocation? =
        repository
            .updateIfExists(id, allocation)
            ?.also { applicationEventPublisher.publishEvent(UpdateBudgetAllocationEvent(it)) }
}
