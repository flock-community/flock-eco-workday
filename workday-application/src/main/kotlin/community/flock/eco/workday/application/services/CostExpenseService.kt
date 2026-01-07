package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.events.CreateExpenseEvent
import community.flock.eco.workday.application.events.UpdateExpenseEvent
import community.flock.eco.workday.application.model.CostExpense
import community.flock.eco.workday.application.repository.CostExpenseRepository
import community.flock.eco.workday.application.services.email.CostExpenseMailService
import community.flock.eco.workday.core.utils.toNullable
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CostExpenseService(
    private val costExpenseRepository: CostExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val costExpenseMailService: CostExpenseMailService,
) {
    private val log: Logger = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun create(costExpense: CostExpense): CostExpense =
        costExpenseRepository
            .save(costExpense)
            .also {
                costExpenseMailService.sendNotification(it)
                applicationEventPublisher.publishEvent(CreateExpenseEvent(it))
            }

    @Transactional
    fun update(
        id: UUID,
        input: CostExpense,
        isUpdatedByOwner: Boolean,
    ): CostExpense? {
        val currentExpense = costExpenseRepository.findById(id).toNullable()
        return currentExpense
            ?.let { costExpenseRepository.save(input) }
            ?.also { applicationEventPublisher.publishEvent(UpdateExpenseEvent(it)) }
            ?.also {
                if (!isUpdatedByOwner) {
                    costExpenseMailService.sendUpdate(it)
                }
            }
    }
}
