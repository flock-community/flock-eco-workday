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
@Profile("develop")
class LoadContractData(
    private val contractRepository: ContractRepository,
    private val loadPersonData: LoadPersonData
) {

    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    val data: MutableSet<Contract> = mutableSetOf()

    init {
        create("tommy@sesam.straat", ContractType.EXTERNAL, now.minusMonths(2))
        create("ieniemienie@sesam.straat", ContractType.INTERNAL, now.minusMonths(8), now.plusMonths(8))
        create("pino@sesam.straat", ContractType.INTERNAL, now.minusMonths(12), now.plusMonths(4))
        create("bert@sesam.straat", ContractType.EXTERNAL, now.minusMonths(6), now.plusMonths(12))
        create("ernie@sesam.straat", ContractType.INTERNAL, now.minusMonths(4))
    }

    private final fun create(email: String, type: ContractType, from: LocalDate, to: LocalDate? = null) = when (type) {
        ContractType.INTERNAL -> ContractInternal(
            person = loadPersonData.findPersonByUserEmail(email),
            hoursPerWeek = 36,
            monthlySalary = 6000.0,
            from = from,
            to = to
        )
        ContractType.EXTERNAL -> ContractExternal(
            person = loadPersonData.findPersonByUserEmail(email),
            hoursPerWeek = 40,
            hourlyRate = 80.0,
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
