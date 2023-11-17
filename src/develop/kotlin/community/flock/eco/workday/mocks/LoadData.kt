package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadData(
        private val userRepository: UserRepository
) {
    fun <T> loadWhenEmpty(block: () -> T): T? {
        if(load == null){
            load = userRepository.count() == 0L
        }

        if (load == true) {
            return block()
        }

        return null
    }

    companion object{
        var load:Boolean? = null
    }
}
