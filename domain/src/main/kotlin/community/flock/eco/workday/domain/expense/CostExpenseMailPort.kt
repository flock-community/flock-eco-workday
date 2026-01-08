package community.flock.eco.workday.domain.expense

interface CostExpenseMailPort {
    fun sendUpdate(costExpense: CostExpense)

    fun sendNotification(costExpense: CostExpense)
}
