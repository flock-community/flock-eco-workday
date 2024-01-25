package community.flock.eco.workday.controllers

import community.flock.eco.workday.api.validate
import java.util.UUID
import community.flock.eco.workday.api.UUID as UUIDApi

fun UUID.produce(): UUIDApi = UUIDApi(toString()).also(UUIDApi::validate)
