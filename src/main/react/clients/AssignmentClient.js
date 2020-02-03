import moment from "moment"
import {ResourceClient} from "../utils/ResourceClient"
import {PageableClient} from "../utils/PageableClient"

const path = "/api/assignments"

const internalize = it => ({
  ...it,
  startDate: it.startDate && moment(it.startDate, "YYYY-MM-DD"),
  endDate: it.endDate && moment(it.endDate, "YYYY-MM-DD"),
})

const resourceClient = ResourceClient(path)
const pageableClient = PageableClient(path)

export const findByCode = code => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/${code}`, opts).then(res => res.json())
}

function findAllByPersonCode(personCode) {
  return fetch(`${path}?personCode=${personCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    })
    .then(data => data.map(internalize))
}

export const AssignmentClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode,
  findAllByPersonCode,
}
