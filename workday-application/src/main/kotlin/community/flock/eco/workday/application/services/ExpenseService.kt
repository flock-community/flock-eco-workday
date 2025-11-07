package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.events.CreateExpenseEvent
import community.flock.eco.workday.application.events.DeleteExpenseEvent
import community.flock.eco.workday.application.events.UpdateExpenseEvent
import community.flock.eco.workday.application.model.CostExpense
import community.flock.eco.workday.application.model.Expense
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.TravelExpense
import community.flock.eco.workday.application.repository.CostExpenseRepository
import community.flock.eco.workday.application.repository.ExpenseRepository
import community.flock.eco.workday.application.repository.TravelExpenseRepository
import community.flock.eco.workday.application.services.email.CostExpenseMailService
import community.flock.eco.workday.application.services.email.TravelExpenseMailService
import community.flock.eco.workday.core.utils.toNullable
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import javax.transaction.Transactional

@Service
class ExpenseService(
    private val expenseRepository: ExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun findAll(pageable: Pageable): Page<Expense> =
        expenseRepository
            .findAll(pageable)

    fun findById(id: UUID): Expense? =
        expenseRepository
            .findById(id)
            .toNullable()

    fun findAllByPersonUuid(
        personId: UUID,
        pageable: Pageable,
    ): Page<Expense> =
        expenseRepository
            .findAllByPersonUuid(personId, pageable)

    fun findAllByPersonUserCode(
        personCode: String,
        pageable: Pageable,
    ): Page<Expense> =
        expenseRepository
            .findAllByPersonUserCode(personCode, pageable)

    fun findAllByStatus(status: Status) = expenseRepository.findAllByStatus(status)

    @Transactional
    fun deleteById(id: UUID) =
        expenseRepository
            .findByIdOrNull(id)
            ?.run {
                expenseRepository.delete(this)
                    // TODO: nobody listens to this event, can we remove?
                    //  especially since 'this' is removed from the hibernate cache
                    .also { applicationEventPublisher.publishEvent(DeleteExpenseEvent(this)) }
            }
}

@Service
class CostExpenseService(
    private val costExpenseRepository: CostExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val costExpenseMailService: CostExpenseMailService,
) {
    @Transactional
    fun create(it: CostExpense): CostExpense =
        costExpenseRepository
            .save(it)
            .also { applicationEventPublisher.publishEvent(CreateExpenseEvent(it)) }
            .also { costExpenseMailService.sendNotification(it) }

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

@Service
class TravelExpenseService(
    private val travelExpenseRepository: TravelExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val travelExpenseMailService: TravelExpenseMailService,
) {
    @Transactional
    fun create(it: TravelExpense): TravelExpense =
        travelExpenseRepository
            .save(it)
            .also { applicationEventPublisher.publishEvent(CreateExpenseEvent(it)) }
            .also { travelExpenseMailService.sendNotification(it) }

    @Transactional
    fun update(
        id: UUID,
        input: TravelExpense,
        isUpdatedByOwner: Boolean,
    ): TravelExpense? {
        val currentExpense = travelExpenseRepository.findById(id).toNullable()
        return currentExpense
            ?.let { travelExpenseRepository.save(input) }
            ?.also { applicationEventPublisher.publishEvent(UpdateExpenseEvent(it)) }
            ?.also {
                if (!isUpdatedByOwner) {
                    travelExpenseMailService.sendUpdate(it)
                }
            }
    }
}
