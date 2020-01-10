import {responseValidation, ResourceClient} from "../utils/ResourceClient"
import {toHolidayForm} from "../features/holiday/schema"

const path = "/api/holidays"
const client = ResourceClient(path)

const findAllByPersonCode = personCode => {
  return fetch(`${path}?personCode=${personCode}`)
    .then(responseValidation)
    .then(data => data.map(toHolidayForm))
}
const findAll = () => {
  return fetch(`/api/holidays`)
    .then(responseValidation)
    .then(data => data.map(toHolidayForm))
}

const findByCode = holidayCode => {
  return fetch(`${path}/${holidayCode}`)
    .then(responseValidation)
    .then(toHolidayForm)
}

function postHoliday(holiday) {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(holiday),
  }
  return fetch(`/api/holidays`, opts).then(res => res.json())
}

function putHoliday(id, holiday) {
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(holiday),
  }
  return fetch(`/api/holidays/${id}`, opts).then(res => res.json())
}

export const HolidayClient = {
  ...client,
  findAll,
  findByCode,
  findAllByPersonCode,
  postHoliday,
  putHoliday,
}
