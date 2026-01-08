package community.flock.eco.workday.domain.expense

interface TravelExpenseMailPort {
    fun sendUpdate(travelExpense: TravelExpense)

    fun sendNotification(travelExpense: TravelExpense)
}
