package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.forms.ContractExternalForm
import community.flock.eco.workday.forms.ContractInternalForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.repository.ClientRepository
import community.flock.eco.workday.repository.ContractRepository
import community.flock.eco.workday.repository.PersonRepository
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate
import javax.persistence.EntityManager
import javax.transaction.Transactional

@Service
class ContractService(
    private val clientRepository: ClientRepository,
    private val personRepository: PersonRepository,
    private val contractRepository: ContractRepository,
    private val entityManager: EntityManager
) {

    fun findAll(page: Pageable) = contractRepository
        .findAll(page)

    fun findByCode(code: String) = contractRepository
        .findByCode(code)
        .toNullable()

    fun findAllByPersonCode(personCode: String) = contractRepository
        .findAllByPersonCode(personCode)

    fun findAllByPersonUserCode(userCode: String) = contractRepository
        .findAllByPersonUserCode(userCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<Contract> {
        val query = "SELECT c FROM Contract c WHERE c.startDate <= :to AND (c.endDate is null OR c.endDate > :from)"
        return entityManager
            .createQuery(query, Contract::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    @Transactional
    fun create(form: ContractExternalForm): ContractExternal? = form
        .internalize()
        .save()

    @Transactional
    fun create(form: ContractInternalForm): ContractInternal? = form
        .internalize()
        .save()

    @Transactional
    fun update(code: String, form: ContractExternalForm): ContractExternal? = findByCode(code)
        ?.let { form.internalize(it) }
        ?.save()

    @Transactional
    fun update(code: String, form: ContractInternalForm): ContractInternal? = findByCode(code)
        ?.let { form.internalize(it) }
        ?.save()


    @Transactional
    fun deleteByCode(code: String): Unit = contractRepository
        .deleteByCode(code)

    private fun ContractExternalForm.internalize(it: Contract? = null) = ContractExternal(
        id = it?.id ?: 0,
        startDate = this.startDate,
        endDate = this.endDate,
        hourlyRate = this.hourlyRate,
        hoursPerWeek = this.hoursPerWeek,
        person = it?.person
            ?: this.personCode.let { personRepository.findByCode(it).toNullable() }
            ?: error("Cannot find Person")
    )

    private fun ContractInternalForm.internalize(it: Contract? = null) = ContractInternal(
        id = it?.id ?: 0,
        startDate = this.startDate,
        endDate = this.endDate,
        monthlySalary = this.monthlySalary,
        hoursPerWeek = this.hoursPerWeek,
        person = it?.person
            ?: this.personCode.let { personRepository.findByCode(it).toNullable() }
            ?: error("Cannot find Person")
    )

    private fun Contract.save() = contractRepository.save(this)
    private fun ContractExternal.save() = contractRepository.save(this)
    private fun ContractInternal.save() = contractRepository.save(this)
}
