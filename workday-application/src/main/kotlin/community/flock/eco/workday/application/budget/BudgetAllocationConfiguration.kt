package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.MoneyAllocationService
import community.flock.eco.workday.domain.budget.TimeAllocationService
import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BudgetAllocationConfiguration {
    @Bean
    fun budgetAllocationService(
        budgetAllocationPersistenceAdapter: BudgetAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = BudgetAllocationService(
        budgetAllocationRepository = budgetAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )

    @Bean
    fun timeAllocationService(
        timeAllocationPersistenceAdapter: TimeAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = TimeAllocationService(
        repository = timeAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )

    @Bean
    fun moneyAllocationService(
        moneyAllocationPersistenceAdapter: MoneyAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = MoneyAllocationService(
        repository = moneyAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )
}
