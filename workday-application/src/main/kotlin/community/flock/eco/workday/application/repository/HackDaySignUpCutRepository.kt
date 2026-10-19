package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.HackDaySignUpCut
import community.flock.eco.workday.application.model.HackDaySignUpCutId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface HackDaySignUpCutRepository : JpaRepository<HackDaySignUpCut, HackDaySignUpCutId> {
    @Query(
        "SELECT c FROM HackDaySignUpCut c JOIN FETCH c.event JOIN FETCH c.person " +
            "WHERE c.event.from <= :to AND c.event.to >= :from AND c.person.uuid = :personCode",
    )
    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): List<HackDaySignUpCut>

    fun deleteByEventCode(eventCode: String)

    fun deleteByEventCodeAndPersonUuid(
        eventCode: String,
        personUuid: UUID,
    )
}
