package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadData(
        private val userRepository: UserRepository
) {
    fun loadWhenEmpty(block: () -> Unit) {

        if(load == null){
            load = userRepository.count() == 0L
        }

        if (load == true) {
            block()
        }
    }

    companion object{
        var load:Boolean? = null
    }
}
