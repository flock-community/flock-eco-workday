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
  return {
    from: it.dates[0].format(moment.HTML5_FMT.DATE),
    to: it.dates[1].format(moment.HTML5_FMT.DATE),
    days: it.days,
    hours: it.hours,
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

export const SickdayClient = {
  ...ResourceClient(path),
  fetchAll,
  fetchAllWithFilters,
}
