package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.services.CostExpenseService
import community.flock.eco.workday.services.TravelExpenseService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadExpensesData(
        private val loadData: LoadData,
        private val loadPersonData: LoadPersonData,
        private val travelExpenseService: TravelExpenseService,
        private val costExpenseService: CostExpenseService
) {

    val now = LocalDate.now()
    val data: MutableList<Expense> = mutableListOf()

    init {
        loadData.loadWhenEmpty {
            // To get some variety in the list sizes of expenses, the number of
            // expense sets (one of each type) is based on the list index
            loadPersonData.data.forEachIndexed() { index, person ->
                createExpenses(person, index)
            }
        }
    }

    private fun createExpenses(person: Person, sets: Int) {
        for (i in 1..sets) {
            TravelExpense(
                    date = now.plusDays(i.toLong()),
                    description = "Travel expense description $i",
                    person = person,
                    distance = 100.0,
                    allowance = 0.19
            )
                    .save()
                    .apply { data.add(this) }

            CostExpense(
                    date = now.plusDays(i.toLong()),
                    description = "Cost expense description $i",
                    person = person,
                    amount = 50.0
            )
                    .save()
                    .apply { data.add(this) }
        }
    }

    private fun TravelExpense.save() = travelExpenseService
            .create(this)

    private fun CostExpense.save() = costExpenseService
            .create(this)
}
