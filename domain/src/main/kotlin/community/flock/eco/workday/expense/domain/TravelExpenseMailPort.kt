package community.flock.eco.workday.expense.domain

interface TravelExpenseMailPort {
    fun sendUpdate(travelExpense: TravelExpense<*>)

    fun sendNotification(travelExpense: TravelExpense<*>)
}
