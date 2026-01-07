package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.domain.common.Status
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.CostExpenseService
import community.flock.eco.workday.domain.expense.Expense
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.expense.TravelExpenseService
import community.flock.eco.workday.domain.person.Person
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadExpensesData(
    private val loadPersonData: LoadPersonData,
    private val travelExpenseService: TravelExpenseService,
    private val costExpenseService: CostExpenseService,
    loadData: LoadData,
) {
    val now: LocalDate = LocalDate.now()
    val data: MutableList<Expense> = mutableListOf()

    init {
        loadData.load {
            // To get some variety in the list sizes of expenses, the number of
            // expense sets (one of each type) is based on the list index
            loadPersonData.data.forEachIndexed { index, person ->
                createExpenses(person.toDomain(), index)
            }
        }
    }

    private fun createExpenses(
        person: Person,
        sets: Int,
    ) {
        for (i in 1..sets + 1) {
            TravelExpense(
                id = UUID.randomUUID(),
                date = now.plusDays(i.toLong()),
                description = "Travel expense description $i",
                person = person,
                distance = 100.0,
                allowance = 0.19,
                status = Status.REQUESTED,
            ).save()
                .apply { data.add(this) }

            CostExpense(
                id = UUID.randomUUID(),
                date = now.plusDays(i.toLong()),
                description = "Cost expense description $i",
                person = person,
                amount = 50.0,
                status = Status.REQUESTED,
                files = emptyList(),
            ).save()
                .apply { data.add(this) }
        }
    }

    private fun TravelExpense.save() =
        travelExpenseService
            .create(this)

    private fun CostExpense.save() =
        costExpenseService
            .create(this)
}
