package community.flock.eco.workday.application.expense

import community.flock.eco.workday.domain.expense.CostExpenseService
import community.flock.eco.workday.domain.expense.ExpenseService
import community.flock.eco.workday.domain.expense.TravelExpenseService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class ExpenseConfiguration {
    
    @Bean
    fun expenseService() = ExpenseService(
        expenseRepository = TODO(),
        applicationEventPublisher = TODO()
    )
    
    @Bean
    fun costExpenseService() = CostExpenseService(
        costExpenseRepository = TODO(),
        applicationEventPublisher = TODO(),
        costExpenseMailService = TODO()
    )
    
    @Bean
    fun travelExpenseService() = TravelExpenseService(
        travelExpenseRepository = TODO(),
        applicationEventPublisher = TODO(),
        travelExpenseMailService = TODO()
    )
}
