package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import org.springframework.stereotype.Component

@Component
class LoadClientData(
        private val clientRepository: ClientRepository
) {
    val data: MutableSet<Client> = mutableSetOf()

    init {
        create("ing", "ING")
        create("bolcom", "bol.com")
        create("ns", "NS International")
        create("rabobank", "Rabobank")
    }

    private final fun create(code: String, name: String) = Client(
            code = code,
            name = name)
            .save()

    fun Client.save(): Client = clientRepository
            .save(this)
            .also { data.add(it) }

}
