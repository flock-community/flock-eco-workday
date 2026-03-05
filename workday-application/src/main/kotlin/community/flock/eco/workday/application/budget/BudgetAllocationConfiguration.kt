package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocationService
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
    fun studyTimeBudgetAllocationService(
        studyTimeBudgetAllocationPersistenceAdapter: StudyTimeBudgetAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = StudyTimeBudgetAllocationService(
        repository = studyTimeBudgetAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )

    @Bean
    fun studyMoneyBudgetAllocationService(
        studyMoneyBudgetAllocationPersistenceAdapter: StudyMoneyBudgetAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = StudyMoneyBudgetAllocationService(
        repository = studyMoneyBudgetAllocationPersistenceAdapter,
        applicationEventPublisher = applicationEventPublisher,
    )
}
