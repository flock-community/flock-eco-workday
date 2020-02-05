const path = "/api/graph"

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

export const ChartClient = {
  revenuePerMonthByYear,
}
