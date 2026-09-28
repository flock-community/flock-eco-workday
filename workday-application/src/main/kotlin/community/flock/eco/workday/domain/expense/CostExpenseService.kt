package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import community.flock.eco.workday.domain.common.ApprovalStatus
import java.util.UUID

class CostExpenseService(
    private val costExpenseRepository: CostExpensePersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val costExpenseMailService: CostExpenseMailPort,
) {
    fun create(costExpense: CostExpense<*>): CostExpense<*> =
        costExpenseRepository
            .create(costExpense)
            .also {
                applicationEventPublisher.publishEvent(CreateExpenseEvent(it))
                costExpenseMailService.sendNotification(it)
            }

    fun update(
        id: UUID,
        input: CostExpense<*>,
        isUpdatedByOwner: Boolean,
    ): CostExpense<*>? =
        costExpenseRepository
            .updateIfExists(id, input)
            ?.also {
                applicationEventPublisher.publishEvent(UpdateExpenseEvent(it))
                if (!isUpdatedByOwner) {
                    costExpenseMailService.sendUpdate(it)
                }
            }
}
