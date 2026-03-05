package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher

class StudyTimeBudgetAllocationService(
    private val repository: StudyTimeBudgetAllocationPersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun create(allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation =
        repository
            .create(allocation)
            .also { applicationEventPublisher.publishEvent(CreateBudgetAllocationEvent(it)) }

    fun update(
        id: Long,
        allocation: StudyTimeBudgetAllocation,
    ): StudyTimeBudgetAllocation? =
        repository
            .updateIfExists(id, allocation)
            ?.also { applicationEventPublisher.publishEvent(UpdateBudgetAllocationEvent(it)) }
}
