package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher

class TrainingMoneyBudgetAllocationService(
    private val repository: TrainingMoneyBudgetAllocationPersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun create(allocation: TrainingMoneyBudgetAllocation): TrainingMoneyBudgetAllocation =
        repository
            .create(allocation)
            .also { applicationEventPublisher.publishEvent(CreateBudgetAllocationEvent(it)) }

    fun update(
        id: Long,
        allocation: TrainingMoneyBudgetAllocation,
    ): TrainingMoneyBudgetAllocation? =
        repository
            .updateIfExists(id, allocation)
            ?.also { applicationEventPublisher.publishEvent(UpdateBudgetAllocationEvent(it)) }
}
