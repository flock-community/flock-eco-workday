package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import community.flock.eco.workday.repository.DayRepository
import org.springframework.stereotype.Component

@Component
class LoadClientData(
        private val clientRepository: ClientRepository
){
    init {
        createClient("ING")
        createClient("bol.com")
        createClient("NS International")
        createClient("Rabobank")
    }


    fun createClient(name:String){
        Client(name = name)
                .save()
    }

    fun Client.save() {
        clientRepository.save(this)
    }
}
