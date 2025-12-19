package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.model.Contract
import community.flock.eco.workday.application.model.ContractExternal
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.ContractManagement
import community.flock.eco.workday.application.model.ContractService
import community.flock.eco.workday.application.model.ContractType
import community.flock.eco.workday.application.repository.ContractRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadContractData(
    private val contractRepository: ContractRepository,
    private val loadPersonData: LoadPersonData,
    loadData: LoadData,
) {
    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    val data: MutableSet<Contract> = mutableSetOf()

    init {
        loadData.load {
            create("tommy@sesam.straat", ContractType.EXTERNAL, now.minusMonths(2))
            create("ieniemienie@sesam.straat", ContractType.INTERNAL, now.minusMonths(8), now.plusMonths(8))
            create("pino@sesam.straat", ContractType.INTERNAL, now.minusMonths(12), now.plusMonths(4))
            create("bert@sesam.straat", ContractType.EXTERNAL, now.minusWeeks(50), now.plusWeeks(2))
            create("ernie@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2020, 10, 27), LocalDate.of(2021, 10, 26))
            create("ernie@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2021, 10, 27), LocalDate.of(2021, 12, 31))
            create("ernie@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2022, 1, 1), LocalDate.of(2022, 12, 31))
            create("ernie@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31))
            create("ernie@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31))
            create("ernie@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31))
            create("ernie@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31))
        }
    }

    private fun create(
        email: String,
        type: ContractType,
        from: LocalDate,
        to: LocalDate? = null,
    ) = when (type) {
        ContractType.INTERNAL ->
            ContractInternal(
                person = loadPersonData.findPersonByUserEmail(email),
                hoursPerWeek = 32,
                monthlySalary = 6000.0,
                holidayHours = 192,
                hackHours = 160,
                from = from,
                to = to,
            )

        ContractType.EXTERNAL ->
            ContractExternal(
                person = loadPersonData.findPersonByUserEmail(email),
                hoursPerWeek = 40,
                hourlyRate = 80.0,
                from = from,
                to = to,
            )

        ContractType.MANAGEMENT ->
            ContractManagement(
                person = loadPersonData.findPersonByUserEmail(email),
                monthlyFee = 5000.0,
                from = from,
                to = to,
            )

        ContractType.SERVICE ->
            ContractService(
                description = "Description",
                monthlyCosts = 150.0,
                from = from,
                to = to,
            )
    }.save()

    private fun Contract.save(): Contract =
        contractRepository
            .save(this)
            .also { data.add(it) }
}
