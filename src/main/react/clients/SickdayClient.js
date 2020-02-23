import {ResourceClient, responseValidation} from "../utils/ResourceClient"

import {toHolidayForm} from "../features/holiday/schema"

const path = "/api/sickdays"
const resourceClient = ResourceClient(path)

const findAllByPersonCode = personCode => {
  return fetch(`${path}?personCode=${personCode}`)
    .then(responseValidation)
    .then(data => data.map(toHolidayForm))
}

export const SickdayClient = {
  ...resourceClient,
  findAllByPersonCode,
}
