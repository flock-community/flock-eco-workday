package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher

class TrainingTimeBudgetAllocationService(
    private val repository: TrainingTimeBudgetAllocationPersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun create(allocation: TrainingTimeBudgetAllocation): TrainingTimeBudgetAllocation =
        repository
            .create(allocation)
            .also { applicationEventPublisher.publishEvent(CreateBudgetAllocationEvent(it)) }

    fun update(
        id: Long,
        allocation: TrainingTimeBudgetAllocation,
    ): TrainingTimeBudgetAllocation? =
        repository
            .updateIfExists(id, allocation)
            ?.also { applicationEventPublisher.publishEvent(UpdateBudgetAllocationEvent(it)) }
}
