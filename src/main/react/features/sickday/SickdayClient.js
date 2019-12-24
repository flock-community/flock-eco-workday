import moment from "moment"
import {ResourceClient} from "../../utils/ResourceClient"

const path = {
  sickdays: `/api/sickdays`,
  persons: `/api/persons`,
}

const internalize = it => ({
  ...it,
  from: moment(it.from, "YYYY-MM-DD"),
  to: moment(it.to, "YYYY-MM-DD"),
})

const fetchAll = () => {
  return fetch(path.sickdays)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    })
    .then(data => data.map(internalize))
}

const fetchAllActive = () => fetchAllByStatus("SICK")
const fetchAllArchive = () => fetchAllByStatus("HEALTHY")

const fetchAllByPersonCode = personCode => {
  return fetch(`${path.sickdays}?code=${personCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    })
    .then(data => data.map(internalize))
}

const fetchAllByStatus = status => {
  return fetch(`${path.sickdays}?status=${status}`).then(res => res.json())
}

export const SickdayClient = {
  ...ResourceClient(path),
  fetchAll,
  fetchAllArchive,
  fetchAllArchive,
  fetchAllByStatus,
  fetchAllByPersonCode,
}
