const path = "/api/aggregations"

export const totalPerClientByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/total-per-client?year=${year}`, opts).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}
export const totalPerPersonByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/total-per-person?year=${year}`, opts).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}
export const totalPerPersonByYearMonth = (year, month) => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/total-per-person?year=${year}&month=${month}`, opts).then(
    res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    }
  )
}

export const totalPerMonthByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/total-per-month?year=${year}`, opts).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

export const AggregationClient = {
  totalPerClientByYear,
  totalPerPersonByYear,
  totalPerPersonByYearMonth,
  totalPerMonthByYear,
}
