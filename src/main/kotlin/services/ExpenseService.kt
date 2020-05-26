package community.flock.eco.workday.services

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.StorageOptions
import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.model.WorkDaySheet
import community.flock.eco.workday.repository.CostExpenseRepository
import community.flock.eco.workday.repository.ExpenseRepository
import community.flock.eco.workday.repository.TravelExpenseRepository
import community.flock.eco.workday.repository.WorkDayRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.persistence.EntityManager


@Service
class ExpenseService(
    private val expenseRepository: ExpenseRepository
) {

    fun findAll(pageable: Pageable): Page<Expense> = expenseRepository
        .findAll(pageable)

    fun findAllByPersonCode(personCode:String, pageable: Pageable): Page<Expense> = expenseRepository
        .findAllByPersonCode(personCode, pageable)

}


@Service
class CostExpenseService(
    private val costExpenseRepository: CostExpenseRepository
) {

    fun findById(id: UUID): CostExpense? = costExpenseRepository
        .findById(id)
        .toNullable()

    fun create(it: CostExpense): CostExpense = costExpenseRepository
        .save(it)

    fun update(it: CostExpense): CostExpense = costExpenseRepository
        .save(it)

}

@Service
class TravelExpenseService(
    private val travelExpenseRepository: TravelExpenseRepository
) {

    fun findById(id: UUID): TravelExpense? = travelExpenseRepository
        .findById(id)
        .toNullable()

    fun create(it: TravelExpense): TravelExpense = travelExpenseRepository
        .save(it)

    fun update(it: TravelExpense): TravelExpense = travelExpenseRepository
        .save(it)

}


