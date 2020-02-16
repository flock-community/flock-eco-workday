import React, {useEffect, useState} from "react"
import BarChart from "recharts/es6/chart/BarChart"
import CartesianGrid from "recharts/es6/cartesian/CartesianGrid"
import XAxis from "recharts/es6/cartesian/XAxis"
import YAxis from "recharts/es6/cartesian/YAxis"
import Legend from "recharts/es6/component/Legend"
import Tooltip from "recharts/es6/component/Tooltip"
import Bar from "recharts/es6/cartesian/Bar"
import ResponsiveContainer from "recharts/es6/component/ResponsiveContainer"
import PropTypes from "prop-types"
import {AggregationClient} from "../../clients/AggregationClient"

function pad(n, width, z) {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z || "0") + n
}

export function RevenueCostPerMonthChart({year}) {
  const date = new Date()
  const y = year || date.getFullYear()
  const [state, setState] = useState({})

  useEffect(() => {
    Promise.all([
      AggregationClient.revenuePerMonthByYear(y),
      AggregationClient.costPerMonthByYear(y),
    ]).then(([revenue, cost]) => {
      const data = Array(12)
        .fill(1)
        .map((_, i) => pad(i + 1, 2))
        .map(day => {
          const dayMonth = `${y}-${day}`
          return {
            name: dayMonth,
            cost: cost[dayMonth],
            revenue: revenue[dayMonth],
          }
        })
      setState(data)
    })
  }, [])

  return (
    <ResponsiveContainer>
      <BarChart data={state}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={value => new Intl.NumberFormat("en").format(value)} />
        <Legend />
        <Bar dataKey="revenue" fill="#3f51b5" />
        <Bar dataKey="cost" fill="#3f51b5" />
      </BarChart>
    </ResponsiveContainer>
  )
}

RevenueCostPerMonthChart.propTypes = {
  year: PropTypes.number,
}
