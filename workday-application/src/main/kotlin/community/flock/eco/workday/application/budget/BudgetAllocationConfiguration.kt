package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.TrainingMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocationService
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
    fun hackTimeBudgetAllocationService(
        hackTimeBudgetAllocationPersistenceAdapter: HackTimeBudgetAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = HackTimeBudgetAllocationService(
        repository = hackTimeBudgetAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )

    @Bean
    fun trainingTimeBudgetAllocationService(
        trainingTimeBudgetAllocationPersistenceAdapter: TrainingTimeBudgetAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = TrainingTimeBudgetAllocationService(
        repository = trainingTimeBudgetAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )

    @Bean
    fun trainingMoneyBudgetAllocationService(
        trainingMoneyBudgetAllocationPersistenceAdapter: TrainingMoneyBudgetAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = TrainingMoneyBudgetAllocationService(
        repository = trainingMoneyBudgetAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )
}
