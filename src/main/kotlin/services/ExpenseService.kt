package community.flock.eco.workday.services

import CreateExpenseEvent
import DeleteExpenseEvent
import UpdateExpenseEvent
import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.repository.CostExpenseRepository
import community.flock.eco.workday.repository.ExpenseRepository
import community.flock.eco.workday.repository.TravelExpenseRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.UUID
import javax.transaction.Transactional


@Service
class ExpenseService(
    private val expenseRepository: ExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher
) {

    fun findAll(pageable: Pageable): Page<Expense> = expenseRepository
        .findAll(pageable)

    fun findById(id: UUID): Expense? = expenseRepository
        .findById(id)
        .toNullable()

    fun findAllByPersonCode(personCode: String, pageable: Pageable): Page<Expense> = expenseRepository
        .findAllByPersonCode(personCode, pageable)

    @Transactional
    fun deleteById(id: UUID) = expenseRepository
        .findById(id)
        .toNullable()
        ?.also { expenseRepository.delete(it) }
        ?.also{applicationEventPublisher.publishEvent(DeleteExpenseEvent(it))}

}


@Service
class CostExpenseService(
    private val costExpenseRepository: CostExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher
) {

    @Transactional
    fun create(it: CostExpense): CostExpense = costExpenseRepository
        .save(it)
        .also{applicationEventPublisher.publishEvent(CreateExpenseEvent(it))}

    @Transactional
    fun update(id:UUID, input: CostExpense): CostExpense? = costExpenseRepository
        .findById(id)
        .toNullable()
        ?.let { costExpenseRepository.save(input) }
        ?.also{applicationEventPublisher.publishEvent(UpdateExpenseEvent(it))}

}

@Service
class TravelExpenseService(
    private val travelExpenseRepository: TravelExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher
) {

    @Transactional
    fun create(it: TravelExpense): TravelExpense = travelExpenseRepository
        .save(it)
        .also{applicationEventPublisher.publishEvent(CreateExpenseEvent(it))}

    @Transactional
    fun update(id:UUID, input: TravelExpense): TravelExpense? = travelExpenseRepository
        .findById(id)
        .toNullable()
        ?.let { travelExpenseRepository.save(input) }
        ?.also{applicationEventPublisher.publishEvent(UpdateExpenseEvent(it))}

}


