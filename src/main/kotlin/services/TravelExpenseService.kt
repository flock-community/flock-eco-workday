package community.flock.eco.workday.services

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.StorageOptions
import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.model.WorkDaySheet
import community.flock.eco.workday.repository.TravelExpenseRepository
import community.flock.eco.workday.repository.WorkDayRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.persistence.EntityManager


@Service
class TravelExpenseService(
    private val travelExpenseRepository: TravelExpenseRepository
) {

    fun findByCode(code: String): TravelExpense? = travelExpenseRepository
        .findByCode(code)
        .toNullable()


}
