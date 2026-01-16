package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Status

fun ApprovalStatus.toEntity(): Status =
    when (this) {
        ApprovalStatus.REQUESTED -> Status.REQUESTED
        ApprovalStatus.APPROVED -> Status.APPROVED
        ApprovalStatus.REJECTED -> Status.REJECTED
        ApprovalStatus.DONE -> Status.DONE
    }

fun Status.toDomain(): ApprovalStatus =
    when (this) {
        Status.REQUESTED -> ApprovalStatus.REQUESTED
        Status.APPROVED -> ApprovalStatus.APPROVED
        Status.REJECTED -> ApprovalStatus.REJECTED
        Status.DONE -> ApprovalStatus.DONE
    }
