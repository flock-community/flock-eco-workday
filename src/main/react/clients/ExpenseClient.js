import moment from "moment"
import {ResourceClient, responseValidation} from "../utils/ResourceClient"

const internalize = it => ({
  ...it,
  date: moment(it.date),
})

const path = "/api/expenses"
const resourceClient = ResourceClient(path, internalize)

const findAllByPersonCode = personCode => {
  return fetch(`${path}?personCode=${personCode}&sort=date,desc`)
    .then(responseValidation)
    .then(data => data.map(internalize))
}

const post = (type, item) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  }
  return fetch(`/api/expenses-${type.toLowerCase()}`, opts).then(internalize)
}

const put = (id, type, item) => {
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  }
  return fetch(`/api/expenses-${type.toLowerCase()}/${id}`, opts).then(internalize)
}

export const ExpenseClient = {
  ...resourceClient,
  post,
  put,
  findAllByPersonCode,
}
