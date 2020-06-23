import moment from "moment"
import {ResourceClient, responseValidation} from "../utils/ResourceClient"

const internalize = it => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
  days: it.days && it.days.length === 0 ? null : it.days,
})

const path = "/api/workdays"
const resourceClient = ResourceClient(path, internalize)

const findAllByPersonCode = personCode => {
  return fetch(`${path}?personCode=${personCode}&sort=from,desc`)
    .then(responseValidation)
    .then(it => it.map(internalize))
}

export const WorkDayClient = {
  ...resourceClient,
  findAllByPersonCode,
}
