package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.events.CreateExpenseEvent
import community.flock.eco.workday.application.events.UpdateExpenseEvent
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.domain.expense.CostExpense
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.UUID
import community.flock.eco.workday.application.expense.CostExpense as CostExpenseEntity

@Service
class CostExpenseService(
    private val costExpenseRepository: CostExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val costExpenseMailService: CostExpenseMailService,
) {
    @Transactional
    fun create(it: CostExpense): CostExpense =
        costExpenseRepository
            .save(it.toEntity())
            .also {
                applicationEventPublisher.publishEvent(CreateExpenseEvent(it))
                costExpenseMailService.sendNotification(it)
            }.toDomain()

    @Transactional
    fun update(
        id: UUID,
        input: CostExpense,
        isUpdatedByOwner: Boolean,
    ): CostExpense? {
        val currentExpense = costExpenseRepository.findById(id).toNullable()
        return currentExpense
            ?.let { costExpenseRepository.save(input.toEntity()) }
            ?.also { applicationEventPublisher.publishEvent(UpdateExpenseEvent(it)) }
            ?.also {
                if (!isUpdatedByOwner) {
                    costExpenseMailService.sendUpdate(it)
                }
            }?.toDomain()
    }
}

fun CostExpense.toEntity() =
    CostExpenseEntity(
        id = id,
        date = date,
        description = description,
        person = person.toEntity(),
        status = status,
        amount = amount,
        files = files.map { it.toEntity() }.toMutableList(),
    )

fun CostExpenseEntity.toDomain() =
    CostExpense(
        id = id,
        date = date,
        description = description,
        person = person.toDomain(),
        status = status,
        amount = amount,
        files = files.map { it.toDomain() },
    )
