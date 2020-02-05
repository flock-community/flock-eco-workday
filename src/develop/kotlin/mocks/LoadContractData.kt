package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
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
        create("bert@sesam.straat", ContractType.INTERNAL, 40, 50.0, LocalDate.of(2018, 6, 1))
        create("ieniemienie@sesam.straat",  ContractType.INTERNAL, 40, 50.0, LocalDate.of(2018, 6, 1), LocalDate.of(2018, 12, 1))
        create("pino@sesam.straat",  ContractType.INTERNAL, 40, 50.0,LocalDate.of(2019, 2, 1), LocalDate.of(2020, 2, 1))
    }

    private final fun create(email: String, type:ContractType, hours: Int, money: Double, startDate: LocalDate, endDate: LocalDate? = null) = when(type) {
        ContractType.INTERNAL -> ContractInternal(
            person = loadPersonData.findPersonByUserEmail(email),
            hoursPerWeek = hours,
            monthlySalary = money,
            startDate = startDate,
            endDate = endDate
        )
        ContractType.EXTERNAL -> ContractExternal(
            person = loadPersonData.findPersonByUserEmail(email),
            hoursPerWeek = hours,
            hourlyRate = money,
            startDate = startDate,
            endDate = endDate
        )
    }.save()

    private fun Contract.save(): Contract = contractRepository
        .save(this)
        .also { data.add(it) }
}
