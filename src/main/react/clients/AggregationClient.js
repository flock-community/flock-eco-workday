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

export const AggregationClient = {
  revenuePerMonthByYear,
  costPerMonthByYear,
}
