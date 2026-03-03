package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher

class StudyMoneyBudgetAllocationService(
    private val repository: StudyMoneyBudgetAllocationPersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun create(allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation =
        repository.create(allocation)
            .also { applicationEventPublisher.publishEvent(CreateBudgetAllocationEvent(it)) }

    fun update(id: Long, allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation? =
        repository.updateIfExists(id, allocation)
            ?.also { applicationEventPublisher.publishEvent(UpdateBudgetAllocationEvent(it)) }
}
