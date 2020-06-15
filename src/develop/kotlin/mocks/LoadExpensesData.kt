package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.services.CostExpenseService
import community.flock.eco.workday.services.TravelExpenseService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadExpensesData(
    private val loadPersonData: LoadPersonData,
    private val travelExpenseService: TravelExpenseService,
    private val costExpenseService: CostExpenseService
) {

    val now = LocalDate.now()
    val data: MutableList<Expense> = mutableListOf()

    init {
        loadPersonData.data.forEach {
            TravelExpense(
                date = now,
                description = "Travel expense description",
                person = it,
                distance = 100.0,
                allowance = 0.19)
                .save()
                .apply { data.add(this) }

            CostExpense(
                date = now,
                description = "Cost expense description",
                person = it,
                amount = 50.0)
                .save()
                .apply { data.add(this) }
        }
    }

    private fun TravelExpense.save() = travelExpenseService
        .create(this)

    private fun CostExpense.save() = costExpenseService
        .create(this)

}


