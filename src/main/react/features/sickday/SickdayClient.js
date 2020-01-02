import moment from "moment"
import {ResourceClient} from "../../utils/ResourceClient"

const path = "/api/sickdays"
const client = ResourceClient(path)

const validateResponse = res => {
  if (!res.ok) throw new Error(res.statusText)
  if (res.status === 204) return null

  return res.json()
}

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
  dates: [moment(it.period.from, "YYYY-MM-DD"), moment(it.period.to, "YYYY-MM-DD")],
})

const reprApi = it => {
  const [period, personCode] = it
  period.days = period.days.slice(0, -1)

  return {
    description: "Sick",
    from: period.dates[0].format(moment.HTML5_FMT.DATE),
    to: period.dates[1].format(moment.HTML5_FMT.DATE),
    status: "SICK",
    days: period.days,
    hours: period.hours,
    personCode,
  }
}

const createFilter = (personCode, status) => {
  const filters = ["?"]
  if (personCode) filters.push(`code=${personCode}`, "&")
  if (status) filters.push(`status=${status}`, "&")

  return filters
    .toString()
    .replace(/,/gi, "")
    .slice(0, -1)
}

const fetchAll = (filter = "") =>
  fetch(`${path}${filter}`)
    .then(validateResponse)
    .then(data => data.map(internalize))

const fetchAllWithFilters = (personCode, status) =>
  fetchAll(createFilter(personCode, status))

const post = sickday => client.post(reprApi(sickday))
const put = (code, sickday) => client.put(code, reprApi(sickday))

export const SickdayClient = {
  fetchAll,
  fetchAllWithFilters,
  post,
  put,
}
