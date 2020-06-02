package community.flock.eco.workday.services

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.StorageOptions
import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Document
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.TravelExpense
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.model.WorkDaySheet
import community.flock.eco.workday.repository.CostExpenseRepository
import community.flock.eco.workday.repository.ExpenseRepository
import community.flock.eco.workday.repository.TravelExpenseRepository
import community.flock.eco.workday.repository.WorkDayRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.persistence.EntityManager


@Service
class DocumentService {

    val bucketName = "flock-workday-documents"

    fun storeDocument(byteArray: ByteArray): UUID {
        return UUID.randomUUID()
            .apply {
                BlobInfo
                    .newBuilder(bucketName, toString())
                    .build()
                    .apply {
                        WorkDayService.storage.create(this, byteArray)
                    }
            }
    }

    fun readDocument(uuid: UUID): ByteArray {
        val blob = WorkDayService.storage.get(bucketName, uuid.toString())
        return blob.getContent()
    }

}
