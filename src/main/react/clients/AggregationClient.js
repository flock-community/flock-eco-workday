const path = "/api/aggregations"

export const revenuePerMonthByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/revenue-per-month?year=${year}`, opts).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

export const costPerMonthByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/cost-per-month?year=${year}`, opts).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

export const holidayPerPersonByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/holiday-per-person?year=${year}`, opts).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

export const sickdayPerPersonByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/sickday-per-person?year=${year}`, opts).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

export const revenuePerClientByYear = year => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/revenue-per-client?year=${year}`, opts).then(res => {
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
  revenuePerMonthByYear,
  costPerMonthByYear,
  holidayPerPersonByYear,
  sickdayPerPersonByYear,
  revenuePerClientByYear,
  totalPerPersonByYearMonth,
  totalPerMonthByYear,
}
