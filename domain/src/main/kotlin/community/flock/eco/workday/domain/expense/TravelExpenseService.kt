package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.application.events.CreateExpenseEvent
import community.flock.eco.workday.application.events.UpdateExpenseEvent
import community.flock.eco.workday.core.utils.toNullable
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class TravelExpenseService(
    private val travelExpenseRepository: TravelExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val travelExpenseMailService: TravelExpenseMailService,
) {
    @Transactional
    fun create(travelExpense: TravelExpense): TravelExpense =
        travelExpenseRepository
            .save(travelExpense.toEntity())
            .also { applicationEventPublisher.publishEvent(CreateExpenseEvent(it)) }
            .also {
                travelExpenseMailService.sendNotification(it)
            }.toDomain()

    @Transactional
    fun update(
        id: UUID,
        input: TravelExpense,
        isUpdatedByOwner: Boolean,
    ): TravelExpense? {
        val currentExpense = travelExpenseRepository.findById(id).toNullable()
        return currentExpense
            ?.let { travelExpenseRepository.save(input.toEntity()) }
            ?.also { applicationEventPublisher.publishEvent(UpdateExpenseEvent(it)) }
            ?.also {
                if (!isUpdatedByOwner) {
                    travelExpenseMailService.sendUpdate(it)
                }
            }?.toDomain()
    }
}

