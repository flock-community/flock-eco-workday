package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher

class TimeAllocationService(
    private val repository: TimeAllocationPersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun create(allocation: TimeAllocation): TimeAllocation =
        repository
            .create(allocation)
            .also { applicationEventPublisher.publishEvent(CreateBudgetAllocationEvent(it)) }

    fun update(
        code: String,
        allocation: TimeAllocation,
    ): TimeAllocation? =
        repository
            .updateByCode(code, allocation)
            ?.also { applicationEventPublisher.publishEvent(UpdateBudgetAllocationEvent(it)) }
}
