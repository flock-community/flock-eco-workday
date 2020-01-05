import moment from "moment"
import {responseValidation, ResourceClient} from "../utils/ResourceClient"

const path = "/api/holidays"
const client = ResourceClient(path)

const internalize = it => ({
  ...it,
  period: {
    ...it.period,
    from: moment(it.period.from, "YYYY-MM-DD"),
    to: moment(it.period.to, "YYYY-MM-DD"),
    days: it.period.days.map(day => ({
      ...day,
      date: moment(day.date, "YYYY-MM-DD"),
    })),
  },
})
function findAllByUserCode(userCode) {
  return fetch(`/api/holidays?userCode=${userCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    })
    .then(data => data.map(internalize))
}

function findAll() {
  return fetch(`/api/holidays`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    })
    .then(data => data.map(internalize))
}

const findByCode = holidayCode => {
  fetch(`${path}/${holidayCode}`).then(responseValidation)
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

export default {
  ...client,
  findAll,
  findByCode,
  findAllByUserCode,
  postHoliday,
  putHoliday,
}
