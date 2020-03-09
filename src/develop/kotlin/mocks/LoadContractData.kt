package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractManagement
import community.flock.eco.workday.model.ContractService
import community.flock.eco.workday.model.ContractType
import community.flock.eco.workday.repository.ContractRepository
import java.time.LocalDate
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadContractData(
    private val contractRepository: ContractRepository,
    private val loadPersonData: LoadPersonData
) {

    val data: MutableSet<Contract> = mutableSetOf()

    init {
        create("bert@sesam.straat", ContractType.EXTERNAL, LocalDate.of(2018, 6, 1))
        create("ieniemienie@sesam.straat", ContractType.INTERNAL, LocalDate.of(2018, 6, 1), LocalDate.of(2018, 12, 1))
        create("pino@sesam.straat", ContractType.INTERNAL, LocalDate.of(2019, 2, 1), LocalDate.of(2020, 2, 1))
        create("bert@sesam.straat", ContractType.MANAGEMENT, LocalDate.of(2019, 2, 1), LocalDate.of(2020, 2, 1))
        create("ernie@sesam.straat", ContractType.SERVICE, LocalDate.of(2019, 2, 1), LocalDate.of(2020, 2, 1))
    }

    private final fun create(email: String, type: ContractType, from: LocalDate, to: LocalDate? = null) = when (type) {
        ContractType.INTERNAL -> ContractInternal(
            person = loadPersonData.findPersonByUserEmail(email),
            hoursPerWeek = 36,
            monthlySalary = 4000.0,
            from = from,
            to = to
        )
        ContractType.EXTERNAL -> ContractExternal(
            person = loadPersonData.findPersonByUserEmail(email),
            hoursPerWeek = 40,
            hourlyRate = 90.0,
            from = from,
            to = to
        )
        ContractType.MANAGEMENT -> ContractManagement(
            person = loadPersonData.findPersonByUserEmail(email),
            monthlyFee = 5000.0,
            from = from,
            to = to
        )

        ContractType.SERVICE -> ContractService(
            description = "Description",
            monthlyCosts = 150.0,
            from = from,
            to = to
        )
    }.save()

    private fun Contract.save(): Contract = contractRepository
        .save(this)
        .also { data.add(it) }
}
