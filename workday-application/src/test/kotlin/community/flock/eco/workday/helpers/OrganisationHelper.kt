package community.flock.eco.workday.helpers

import community.flock.eco.workday.application.model.ContractType
import community.flock.eco.workday.application.model.Person
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@Import(CreateHelper::class)
class OrganisationHelper(
    val createHelper: CreateHelper,
) {
    private val from: LocalDate = LocalDate.of(2020, 1, 1)
    private val to: LocalDate = LocalDate.of(2021, 12, 31)

    fun createPersonsWithContract(contractType: ContractType): Person {
        val person = createHelper.createPerson()
        when (contractType) {
            ContractType.INTERNAL -> createHelper.createContractInternal(person, from, to)
            ContractType.EXTERNAL -> createHelper.createContractExternal(person, from, to)
            ContractType.MANAGEMENT -> createHelper.createContractInternal(person, from, to)
            ContractType.SERVICE -> TODO()
        }
        return person
    }
}
