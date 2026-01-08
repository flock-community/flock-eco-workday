package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import java.util.UUID

class TravelExpenseService(
    private val travelExpenseRepository: TravelExpensePersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val travelExpenseMailService: TravelExpenseMailPort,
) {
    fun create(travelExpense: TravelExpense): TravelExpense =
        travelExpenseRepository
            .create(travelExpense)
            .also {
                applicationEventPublisher.publishEvent(CreateExpenseEvent(it))
                travelExpenseMailService.sendNotification(it)
            }

    fun update(
        id: UUID,
        input: TravelExpense,
        isUpdatedByOwner: Boolean,
    ): TravelExpense? =
        travelExpenseRepository
            .updateIfExists(id, input)
            ?.also {
                applicationEventPublisher.publishEvent(UpdateExpenseEvent(it))
                if (!isUpdatedByOwner) {
                    travelExpenseMailService.sendUpdate(it)
                }
            }
}
