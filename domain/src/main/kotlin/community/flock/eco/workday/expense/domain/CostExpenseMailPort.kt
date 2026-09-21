package community.flock.eco.workday.expense.domain

interface CostExpenseMailPort {
    fun sendUpdate(costExpense: CostExpense<*>)

    fun sendNotification(costExpense: CostExpense<*>)
}
