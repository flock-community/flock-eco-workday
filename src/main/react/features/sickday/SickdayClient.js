import moment from "moment"
import {ResourceClient} from "../../utils/ResourceClient"

const path = "/api/sickdays"

const validateResponse = res => {
  if (!res.ok) throw new Error(res.statusText)
  if (res.status === 204) return null

  return res.json()
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
const createFilter = (personCode, status) => {
  const filters = ["?"]
  if (personCode) filters.push(`code=${personCode}`, "&")
  if (status) filters.push(`status=${status}`, "&")

  return filters
    .toString()
    .replace(/,/gi, "")
    .slice(0, -1)
}

    .then(data => data.map(internalize))
}

}

export const SickdayClient = {
  ...ResourceClient(path),
  fetchAll,
}
