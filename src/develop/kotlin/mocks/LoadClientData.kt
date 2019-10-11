package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import org.springframework.stereotype.Component

@Component
class LoadClientData(
        private val clientRepository: ClientRepository
) {
    val clients: MutableSet<Client> = mutableSetOf()

    init {
        create("ING")
        create("bol.com")
        create("NS International")
        create("Rabobank")
    }

    private final fun create(name: String) = Client(name = name).save()

    fun Client.save(): Client = clientRepository
            .save(this)
            .also { clients.add(it) }

}
