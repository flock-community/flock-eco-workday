import moment from "moment"
import {ResourceClient, responseValidation} from "../utils/ResourceClient"

const internalize = it => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
})

const path = "/api/holidays"
const resourceClient = ResourceClient(path, internalize)

const findAllByPersonCode = personCode => {
  return fetch(`${path}?personCode=${personCode}`)
    .then(responseValidation)
    .then(data => data.map(internalize))
}

export const HolidayClient = {
  ...resourceClient,
  findAllByPersonCode,
}
